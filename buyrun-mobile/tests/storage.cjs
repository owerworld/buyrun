const fs = require("node:fs"),
  vm = require("node:vm"),
  assert = require("node:assert/strict"),
  ts = require("typescript");
const source =
  fs.readFileSync("src/lib/store.tsx", "utf8") +
  "\nexport const audit={readTokens,persistSnapshot,safeCache,expired,readCache};";
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
}).outputText;
const KEY = "buyrun.mobile.v1";
const demo = {
  id: "sample-demo",
  demo: true,
  title: "Örnek",
  date: "2020-01-01",
  guests: [],
};
const party = (id, extra = {}) => ({
  id,
  title: id,
  category: "Buluşma",
  hostName: "Test",
  date: `${new Date().getUTCFullYear() + 2}-05-01`,
  time: "19:00",
  venue: "Test",
  address: "",
  description: "",
  coverId: "cherry",
  guests: [
    {
      id: "g",
      name: "Test",
      status: "pending",
      count: 1,
      token: "PRIVATE-GUEST-TOKEN",
      rsvpUrl: "https://test/private-guest-link",
    },
  ],
  ...extra,
});
const token = (id) => id + "-123456789012345678901234";
class ApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.status = status;
  }
}
function harness({ cache, legacy, api = {}, secureFail = false } = {}) {
  const async = new Map(),
    secure = new Map(),
    writes = [],
    hooks = [],
    effects = [];
  let cursor = 0;
  let fail = secureFail;
  if (cache) async.set(KEY, JSON.stringify(cache));
  if (legacy) secure.set(KEY + ".keys", JSON.stringify(legacy));
  const storage = {
    getItem: async (k) => async.get(k) || null,
    setItem: async (k, v) => {
      writes.push({ type: "plain", key: k, value: v });
      await new Promise((r) => setTimeout(r, k === KEY ? 1 : 0));
      async.set(k, v);
    },
    removeItem: async (k) => {
      async.delete(k);
    },
  };
  const ss = {
    getItemAsync: async (k) => {
      if (fail) throw Error("locked");
      return secure.get(k) || null;
    },
    setItemAsync: async (k, v) => {
      if (fail) throw Error("locked");
      assert.ok(v.length < 2000, "secure values fit per-item limit");
      writes.push({ type: "secret", key: k, value: v });
      secure.set(k, v);
    },
    deleteItemAsync: async (k) => {
      secure.delete(k);
    },
  };
  const react = {
    useCallback: (fn) => fn,
    createContext: () => ({ Provider: "Provider" }),
    useContext: () => {},
    useState(initial) {
      const i = cursor++;
      if (!(i in hooks)) hooks[i] = initial;
      return [
        hooks[i],
        (v) => {
          hooks[i] = typeof v === "function" ? v(hooks[i]) : v;
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      if (!(i in hooks)) hooks[i] = { current: initial };
      return hooks[i];
    },
    useEffect(fn) {
      const i = cursor++;
      if (!(i in hooks)) {
        hooks[i] = true;
        effects.push(fn);
      }
    },
  };
  const apiState = {
    get: async () => {
      throw new ApiError("offline");
    },
    ...api,
  };
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require(name) {
      return name === "react"
        ? react
        : name === "react/jsx-runtime"
          ? { jsx: (type, props) => ({ type, props }) }
          : name === "@react-native-async-storage/async-storage"
            ? storage
            : name === "expo-secure-store"
              ? ss
              : name === "react-native"
                ? {
                    Platform: { OS: "ios" },
                    AppState: { addEventListener: () => ({ remove() {} }) },
                  }
                : name === "./api"
                  ? { api: apiState, ApiError }
                  : name === "./model"
                    ? { demoEvents: [demo] }
                    : require(name);
    },
    setInterval: () => 1,
    clearInterval() {},
    console,
    Date,
    Set,
    Promise,
  };
  vm.runInNewContext(compiled, context);
  const render = () => {
    cursor = 0;
    return module.exports.StoreProvider({ children: null }).props.value;
  };
  async function boot() {
    render();
    effects.forEach((fn) => fn());
    for (let i = 0; i < 100; i++) {
      await new Promise((r) => setTimeout(r, 2));
      if (render().ready) return render();
    }
    throw Error("hydration timeout");
  }
  return {
    audit: module.exports.audit,
    async,
    secure,
    writes,
    render,
    boot,
    api: apiState,
    setFail: (v) => {
      fail = v;
    },
  };
}
(async () => {
  let checks = 0;
  const many = Array.from({ length: 120 }, (_, i) =>
    party("event-" + i, {
      manageToken: token("event-" + i),
      coverData: "PRIVATE-PHOTO",
    }),
  );
  const legacy = Object.fromEntries(many.map((e) => [e.id, e.manageToken]));
  const h = harness({ cache: many, legacy });
  const keys = await h.audit.readTokens(many);
  assert.equal(Object.keys(keys).length, 120);
  checks++;
  await h.audit.persistSnapshot(many, keys);
  assert.equal(h.secure.has(KEY + ".keys"), false);
  assert.equal(h.secure.size, 120);
  assert.equal(JSON.parse(h.async.get(KEY + ".keyIds")).length, 120);
  checks += 3;
  const plaintext = h.async.get(KEY);
  for (const secret of [
    "PRIVATE-GUEST-TOKEN",
    "private-guest-link",
    "PRIVATE-PHOTO",
    "manageToken",
  ]) {
    assert.ok(!plaintext.includes(secret));
    checks++;
  }
  assert.ok(!plaintext.includes(token("event-0")));
  checks++;
  const failed = harness({ cache: many, legacy });
  failed.setFail(true);
  await assert.rejects(() => failed.audit.persistSnapshot(many, legacy));
  assert.ok(failed.secure.has(KEY + ".keys"));
  assert.equal(failed.async.get(KEY + ".keyIds"), undefined);
  checks += 3;
  assert.equal(h.audit.expired(party("old", { date: "2020-01-01" })), true);
  assert.equal(h.audit.expired(party("new")), false);
  assert.equal(h.audit.expired(demo), false);
  assert.equal(
    h.audit.expired(
      party("held", {
        date: "2020-01-01",
        deleteAfter: `${new Date().getUTCFullYear() + 2}-07-01`,
      }),
    ),
    false,
  );
  checks += 4;
  const initial = [
    party("live"),
    party("offline"),
    party("revoked"),
    party("expired", { date: "2020-01-01" }),
    demo,
  ];
  const initialKeys = Object.fromEntries(
    initial.filter((e) => !e.demo).map((e) => [e.id, token(e.id)]),
  );
  const got = [];
  const l = harness({
    cache: initial,
    legacy: initialKeys,
    api: {
      get: async (t) => {
        got.push(t);
        if (t === token("live"))
          return party("live", { title: "Sunucudan güncel", manageToken: t });
        throw new ApiError("unavailable", t === token("revoked") ? 404 : null);
      },
    },
  });
  l.render();
  assert.equal(l.writes.length, 0);
  checks++;
  let store = await l.boot();
  assert.equal(
    store.events.find((e) => e.id === "live").title,
    "Sunucudan güncel",
  );
  assert.ok(store.events.some((e) => e.id === "offline"));
  assert.ok(store.events.some((e) => e.demo));
  assert.ok(
    !store.events.some((e) => e.id === "revoked" || e.id === "expired"),
  );
  assert.ok(!got.includes(token("expired")));
  assert.ok(store.error.includes("Güncel yanıtlar alınamadı"));
  checks += 6;
  assert.equal(l.secure.get(KEY + ".eventKey.offline"), token("offline"));
  assert.ok(!l.secure.has(KEY + ".eventKey.revoked"));
  assert.ok(!l.async.get(KEY).includes("PRIVATE-GUEST-TOKEN"));
  checks += 3;
  l.api.get = async () => {
    throw new ApiError("offline");
  };
  await assert.rejects(() => store.refresh("live"));
  store = l.render();
  assert.ok(store.events.some((e) => e.id === "live"));
  assert.ok(store.error.includes("Güncel yanıtlar alınamadı"));
  checks += 3;
  l.api.get = async () => {
    throw new ApiError("gone", 404);
  };
  await assert.rejects(() => store.refresh("live"));
  store = l.render();
  assert.ok(!store.events.some((e) => e.id === "live"));
  assert.ok(!l.secure.has(KEY + ".eventKey.live"));
  checks += 3;
  const broken = harness({
    cache: initial,
    legacy: initialKeys,
    secureFail: true,
  });
  const brokenStore = await broken.boot();
  assert.ok(brokenStore.ready);
  assert.equal(broken.writes.length, 0);
  await assert.rejects(() => brokenStore.create({}));
  assert.ok(broken.async.get(KEY).includes("offline"));
  checks += 4;
  const orphan = harness({ legacy: { orphan: token("orphan") } });
  await orphan.boot();
  assert.equal(orphan.secure.get(KEY + ".eventKey.orphan"), token("orphan"));
  checks++;
  console.log(
    `${checks} native storage checks passed: per-event secure migration, no plaintext guest capabilities, migration failure safety, startup write guard, expiry, 404 removal, offline retention/status, orphan-token preservation.`,
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
