/**
 * Davet sözleri kütüphanesi.
 *
 * Her davet türünün, her dil tonunun kendi cümleleri var; aynı türdeki iki davet
 * aynı metinle çıkmaz. Cümleler Türkiye'deki davetiye alışkanlıklarından derlendi
 * ve özgün olarak yazıldı:
 *
 *  - Kız istemenin "Allah'ın emri, Peygamber'in kavliyle" formülü, sözde "tatlı yiyip
 *    tatlı konuşmak", "bir fincan kahvenin kırk yıl hatırı", nişanda kurdele,
 *    kınada türküler ve "yüksek yüksek tepeler", askerde kına ve halay, mevlidde
 *    gül, şerbet ve lokum, diş buğdayında meslek seçtirme, iftarda hurma ve su.
 *  - Yunus Emre'nin "Sevelim, sevilelim; dünya kimseye kalmaz" dizesi (kamu malı).
 *  - Esprili dil 2025–2026'da en çok aranan davetiye sözü türü; kısa metinler ön planda.
 *
 * Herkese uysun diye:
 *  - Dinî ifade yalnızca "manevi ve dualı" ton seçildiğinde ya da mevlid, iftar ve
 *    hac gibi günün kendisi dinî olduğunda kullanılır.
 *  - Para, takı, hediye beklentisi hiçbir cümlede yok.
 *  - Bebek davetleri anne–baba rolü varsaymaz; "bebeğimiz", "ailemiz" der.
 *  - Rahmetli anısına mevlidde kutlama sözcüğü yok.
 *  - "Büyükler ve akrabalar" seçildiyse argo ve "sen" dili ayıklanır; "arkadaşlar"
 *    seçildiyse ağır resmî kalıplar geri plana düşer.
 *
 * Aynı davet için sıra sabittir (isim ve tarihten türeyen tohum); "Başka metin öner"
 * düğmesi listede bir sonrakine geçer.
 */

import type { Answers } from "./wizard";

export type Ton = "zarif" | "sicak" | "neseli" | "manevi";
const TONLAR: Ton[] = ["zarif", "sicak", "neseli", "manevi"];

/** b: resmî, büyüklere hitap eden; a: samimi, yalnızca arkadaş çevresine uyan cümle. */
type Cumle = string | { t: string; k: "a" | "b" };
type Havuz = Partial<Record<Ton | "hepsi", Cumle[]>>;

const b = (t: string): Cumle => ({ t, k: "b" });
const a = (t: string): Cumle => ({ t, k: "a" });

const YUNUS = "Yunus Emre'nin dediği gibi: “Sevelim, sevilelim; dünya kimseye kalmaz.”";

/* ------------------------------------------------------------------ */
/* Tören: düğün, nişan, söz                                            */
/* ------------------------------------------------------------------ */

const DUGUN: Havuz = {
  zarif: [
    "Hayatlarımızı birleştirdiğimiz bu anlamlı günde sizleri de aramızda görmekten onur duyarız.",
    "Bir ömür sürecek yolculuğumuzun ilk adımını atıyoruz. Bu özel günde yanımızda olmanız bizim için çok kıymetli.",
    b("Sevgiyle başlayan hikâyemizi sevdiklerimizin huzurunda taçlandırmak istiyoruz. Teşriflerinizle bize şeref verirsiniz."),
    `${YUNUS} Bu güzel günü sevdiklerimizle paylaşmak istiyoruz.`,
    "Dünya evine girdiğimiz bu mutlu günde sizleri de aramızda görmek en büyük dileğimiz.",
  ],
  sicak: [
    "Bu güzel günü sevdiklerimizle paylaşmak istiyoruz. Sizi de aramızda görmek bizi çok mutlu eder.",
    "Aynı yola baktık, şimdi aynı evin kapısını açıyoruz. Bu mutluluğu sizinle paylaşmadan olmaz.",
    "Sevdiklerimizle dolu bir düğün hayal ettik; bu hayalin en güzel parçası sizsiniz.",
    "Biz evleniyoruz! Bu sevinci bizimle paylaşır, gecemize neşe katarsanız çok mutlu oluruz.",
    "Aynı sofrada, aynı halayda, aynı sevinçte buluşalım. Düğünümüzde sizi de bekliyoruz.",
  ],
  neseli: [
    "Uzun zamandır beklenen gün geldi! Bol müzik, bol kahkaha var; sizin de orada olmanız şart.",
    "Aşkımızın yeni sezonu başlıyor, ilk bölümü sizinle izlemek istiyoruz!",
    "Halaylar çekilecek, oyun havaları çalınacak; rahat ayakkabılarınızı seçin, pistte yeriniz hazır!",
    "Evet dedik, geri dönüş yok! Bu mutlu kararı sizinle kutlamak istiyoruz.",
    a("Pasta kesilecek, halaylar çekilecek, gece uzun sürecek... Sensiz olmaz, haberin olsun!"),
  ],
  manevi: [
    "Allah'ın izniyle yuvamızı kuruyoruz. Bu mutlu günümüzde hayır dualarınızla aramızda olmanızı dileriz.",
    b("Allah'ın emri, Peygamberimizin kavliyle dünya evine giriyoruz. Dualarınızla aramızda olmanızı rica ederiz."),
    "Rabbimizin takdiriyle başlayan bu yolda sizlerin duasıyla adım atmak istiyoruz. Teşriflerinizi bekleriz.",
    "Hayırlı bir yuva, huzurlu bir ömür dileğiyle nikâhımızı kıyıyoruz. Bu güzel günümüzde dualarınızı eksik etmeyin.",
  ],
};

const NISAN: Havuz = {
  zarif: [
    "Evliliğe giden yolda ilk adımı atıyoruz. Nişan törenimizde sizleri de aramızda görmekten mutluluk duyarız.",
    b("Yüzüklerimizi sevdiklerimizin huzurunda takmak istiyoruz. Teşriflerinizle bize şeref verirsiniz."),
    "Kalplerimizin verdiği sözü bir yüzükle mühürlüyoruz. Bu anlamlı günde yanımızda olmanızı isteriz.",
  ],
  sicak: [
    "Biz nişanlanıyoruz! Bu güzel haberi sizinle kutlamak istiyoruz; buyurun, beraber sevinelim.",
    "Takılacak yüzüklerin en güzel şahidi siz olun. Nişanımızda sizi bekliyoruz.",
    "Hayatımızın en heyecanlı günlerinden birinde sevdiklerimiz yanımızda olsun istedik.",
  ],
  neseli: [
    "Sonunda yüzükler takılıyor! Kaçırmak istemeyeceğiniz bir gece olacak.",
    "Kurdeleyi kesecek makas hazır, bir siz eksiksiniz!",
    "Nişanlanıyoruz! Tatlılar yenecek, danslar edilecek; siz de gelin, eğlence tam olsun.",
  ],
  manevi: [
    "Allah'ın izniyle nişanlanıyoruz. Bu hayırlı başlangıçta dualarınızla aramızda olmanızı dileriz.",
    b("Hayırlı bir kısmetin ilk adımında büyüklerimizin duasını almak isteriz. Nişan törenimize teşriflerinizi bekleriz."),
  ],
};

const SOZ: Havuz = {
  zarif: [
    "Ailelerimizin rızası ve büyüklerimizin duasıyla birbirimize söz veriyoruz. Bu anlamlı günde sizleri de aramızda görmek isteriz.",
    "Bir fincan kahvenin kırk yıl hatırı vardır; biz o hatırı bir ömre çevirmeye söz veriyoruz. Söz törenimize buyurun.",
  ],
  sicak: [
    "Tatlı yiyip tatlı konuşmak için sizi de aramızda görmek istiyoruz. Söz törenimize buyurun.",
    "Sözümüz söz! Bu güzel başlangıcı sevdiklerimizle paylaşmak istiyoruz.",
    "Aileler tanıştı, kahveler içildi, sözler verildi. Şimdi sıra bu sevinci sizinle paylaşmakta.",
  ],
  neseli: [
    "Kahve tuzlu da olsa içildi, söz kesildi! Kutlamaya siz de gelin.",
    "Söz verdik, sözümüzün arkasındayız! Bu tatlı günde sizi de bekliyoruz.",
  ],
  manevi: [
    b("Allah'ın emri, Peygamberimizin kavliyle söz kesiliyor. Hayırlı olması dileğiyle dualarınızı bekleriz."),
    "Allah'ın izniyle hayırlı bir yola çıkıyoruz. Söz törenimizde dualarınızla aramızda olmanızı dileriz.",
  ],
};

/**
 * Ailelerin ağzından: "Evlatlarımız {A} ile {B} ...". İsimlere ek gelmeyecek biçimde
 * kuruldu; Türkçede ünlü uyumu isimden isme değiştiği için ek tahmin edilmez.
 */
const AILE_SESI: Record<Ton, string[]> = {
  zarif: [
    "Evlatlarımız {A} ile {B} {fiil}. {Davet} teşrif ederek bizleri onurlandırmanızı rica ederiz.",
    "Ailelerimizin rızası ve büyüklerimizin duasıyla evlatlarımız {A} ile {B} {fiil}. Bu mutlu günde sizleri de aramızda görmekten onur duyarız.",
  ],
  sicak: [
    "Evlatlarımız {A} ile {B} {fiil}. Bu sevincimizi paylaşmak için sizi de aramızda görmek istiyoruz.",
    "İki aile bir oluyoruz: {A} ile {B} {fiil}! {Davet} sizleri de bekliyoruz.",
  ],
  neseli: [
    "İki aile bir oluyor, sevincimiz ikiye katlanıyor! {A} ile {B} {fiil}; {davet} sizleri de bekliyoruz.",
  ],
  manevi: [
    "Allah'ın emri, Peygamberimizin kavliyle evlatlarımız {A} ile {B} {fiil}. Hayır dualarınızla aramızda olmanızı dileriz.",
    "Rabbimizin izniyle evlatlarımız {A} ile {B} {fiil}. {Davet} teşriflerinizi ve hayır dualarınızı bekleriz.",
  ],
};
const AILE_FIIL: Record<string, [fiil: string, davet: string]> = {
  dugun: ["dünya evine giriyor", "düğünlerine"],
  nisan: ["nişanlanıyor", "nişanlarına"],
  soz: ["birbirlerine söz veriyor", "söz törenlerine"],
};

/* ------------------------------------------------------------------ */
/* Etkinlikler                                                         */
/* ------------------------------------------------------------------ */

const ETKINLIK: Record<string, Havuz> = {
  kina: {
    zarif: [
      "Gelinimizin kınası yakılacak. Bu anlamlı gecede sizleri de aramızda görmekten mutluluk duyarız.",
      "Baba ocağından yeni yuvasına uğurlamadan önce gelinimizin kınasını sevdiklerimizle yakmak istiyoruz.",
    ],
    sicak: [
      "Kınalar yakılacak, türküler söylenecek. Bu güzel gecede sizi de aramızda görmek istiyoruz.",
      "Bir gözümüzde yaş, bir gözümüzde sevinç... Kına gecemizde yanımızda olun.",
      "Kına tepsileri hazır, mumlar yanıyor. Gelinimizi birlikte uğurlayalım.",
    ],
    neseli: [
      "Çalsın davullar, oynasın kızlar! Kına gecemizde piste çıkmaya hazır olun.",
      "Yüksek yüksek tepelere ev kurmasınlar, ama kınamıza mutlaka gelsinler!",
      "Kına yakılacak, halaylar çekilecek, biraz ağlanacak, çokça gülünecek! Sizi bekliyoruz.",
    ],
    manevi: [
      "Allah'ın izniyle gelinimizin kınası yakılacak. Bu güzel gecede aramızda olmanızı isteriz.",
      "Hayırlı kısmetimizin kına gecesinde dualarınızla yanımızda olmanızı dileriz.",
    ],
  },
  bekarlik: {
    zarif: [
      "Yeni hayatına adım atmadan önce bekârlığına zarif bir veda düzenliyoruz. Sizi de aramızda görmek isteriz.",
      "Unutulmaz bir akşam hazırladık; bu anıda sizin de yeriniz olsun.",
    ],
    sicak: [
      "Bekârlığa son bir kez birlikte veda edelim! Sizi de aramızda görmek isteriz.",
      "Dostlar toplanıyor! Yeni hayatına en güzel anılarla uğurlayalım.",
    ],
    neseli: [
      "Bekârlık bitiyor, eğlence bitmiyor! Son özgür gecede pistte buluşalım.",
      "Nikâh öncesi son parti! Dans ayakkabılarınızı unutmayın.",
      a("Veda etmek hiç bu kadar eğlenceli olmamıştı. Sensiz olmaz!"),
    ],
  },
  sunnet: {
    zarif: [
      "Oğlumuzun sünnet düğününde sizleri de aramızda görmekten onur duyarız.",
      b("Evladımızın hayatındaki bu anlamlı günü sevdiklerimizle paylaşmak isteriz. Teşriflerinizi bekleriz."),
    ],
    sicak: [
      "Bir sünnet, bir bayram, bir dua... Bu güzel günümüzde sizi de aramızda görmek istiyoruz.",
      "Küçük şehzademizin büyük gününe davetlisiniz; siz de gelin, sevincimiz tamam olsun.",
      "Oğlumuz artık büyüdü, maşallah! Bu mutlu günü sizinle kutlamak istiyoruz.",
    ],
    // Sünnette çocuğun ağzından yazmak Türkiye'de en sevilen gelenek
    neseli: [
      "Büyüdüm artık maşallah, çocukluğuma eyvallah! Sünnet düğünümde sizi de bekliyorum.",
      "Pelerinim hazır, tacım başımda! Düğünüme gelmezseniz küserim, haberiniz olsun.",
      "Mecbur oldum boyun eğmeye, dostlar gelin beni teselli etmeye! Sünnet düğünümde sizi bekliyorum.",
    ],
    manevi: [
      "Allah'ın izniyle oğlumuzu sünnet ettiriyoruz. Bu mutlu günümüzde dualarınızla aramızda olmanızı dileriz.",
      "Peygamberimizin sünnetini yerine getiriyoruz. Oğlumuza sağlıklı, hayırlı bir ömür dileyen dualarınızla aramızda olun.",
    ],
  },
  babyshower: {
    zarif: [
      "Minik misafirimizi beklerken bu heyecanı sevdiklerimizle paylaşmak istiyoruz.",
      "Ailemiz büyüyor. Bu güzel bekleyişte sizi de yanımızda görmek isteriz.",
    ],
    sicak: [
      "Minik ayaklar yolda! Bu tatlı heyecanı sizinle paylaşmadan olmaz.",
      "Kalbimiz şimdiden kocaman; minik misafirimizi birlikte karşılamaya hazırlanalım.",
    ],
    neseli: [
      "Bebek geliyor, parti başlıyor! Pastalar hazır, oyunlar hazır, bir siz eksiksiniz.",
      "Uykusuz gecelerden önce son bir parti! Sizi bekliyoruz.",
    ],
    manevi: [
      "Allah'ın izniyle minik bir can aramıza katılıyor. Hayırlı olması dileğiyle bu sevinci sizinle paylaşmak istiyoruz.",
      "Rabbimizin bize emanet edeceği minik misafirimiz için dualarınızla aramızda olmanızı dileriz.",
    ],
  },
  cinsiyet: {
    zarif: [
      "Bebeğimizin cinsiyetini sevdiklerimizle birlikte öğrenmek istiyoruz.",
      "Hayatımızın en güzel sürprizlerinden birini sevdiklerimizle aynı anda öğrenmek istedik.",
    ],
    sicak: [
      "Merakımıza ortak olun! Minik misafirimizin kız mı erkek mi olduğunu hep birlikte öğrenelim.",
      "Bu sırrı en sevdiklerimizle aynı anda öğrenmek istedik. Siz de gelin, birlikte heyecanlanalım.",
    ],
    neseli: [
      "Kız mı, erkek mi? Tahminlerinizi yanınıza alın, cevabı hep birlikte öğrenelim!",
      "Pembe mi, mavi mi? Balonlar patlayınca göreceğiz!",
      "Tahmin yarışması başlıyor! Doğru bilen ilk dileği tutar.",
    ],
  },
  disbugdayi: {
    zarif: [
      "Bebeğimizin ilk dişi çıktı. Bu güzel günü diş buğdayımızda sevdiklerimizle paylaşmak isteriz.",
      "İlk dişin sevincini, kaynayan buğdayın bereketiyle sevdiklerimizle paylaşmak istiyoruz.",
    ],
    sicak: [
      "Minik incimiz göründü! Buğdayımız kaynadı, sofralarımız kuruldu; sizi de bekliyoruz.",
      "İlk dişin sevinci bir başka. Diş buğdayımızda bu mutluluğu birlikte yaşayalım.",
    ],
    // Diş buğdayında bebeğin önüne eşyalar konup "mesleği" seçtirilir
    neseli: [
      "Makas mı, kalem mi, stetoskop mu? Bebeğimiz mesleğini seçiyor; tahminlerinizle gelin!",
      "İlk diş çıktı, kutlama şart! Buğdaylar kaynadı, sizi bekliyoruz.",
    ],
    manevi: [
      "Bebeğimizin ilk dişi çıktı, maşallah! Diş buğdayımızda dualarınızla aramızda olmanızı isteriz.",
      "Allah'a şükür, bebeğimizin ilk dişi çıktı. Nazardan korusun diye dualarınızı bekliyoruz.",
    ],
  },
  dogumgunu: {
    zarif: [
      "Yeni bir yaşı sevdiklerle karşılamak kadar güzeli yok. Bu özel günde sizi de aramızda görmek isteriz.",
      "Bir yaşı daha güzel anılarla uğurlarken yanımızda olmanız bizim için çok değerli.",
    ],
    sicak: [
      "Pastalar, mumlar ve en önemlisi dostlar... Doğum günü kutlamasında sizi de görmek istiyoruz.",
      "Yeni bir yaş, yeni bir sayfa! Bu güzel günü birlikte kutlayalım.",
    ],
    neseli: [
      "Mumları saymayın, sadece gelin! Yeni yaşı birlikte kutlayalım.",
      "Yaş gizli, eğlence belli! Doğum günü partisinde görüşelim.",
      a("Bir yaş daha büyüdük ama kimseye söylemiyoruz! Partide görüşelim."),
    ],
  },
  // Çocuğun doğum günü (sihirbazda "Çocuk ve bebek" grubundan gelindiyse)
  "dogumgunu-cocuk": {
    zarif: ["Minik yıldızımızın doğum gününü sevdiklerimizle kutlamak istiyoruz."],
    sicak: [
      "Bir yaş daha büyüdü, bir kat daha tatlandı! Doğum günü partimizde sizi de görmek istiyoruz.",
      "Pastası hazır, mumları hazır; bir tek siz eksiksiniz.",
    ],
    neseli: [
      "Balonlar şişti, pasta geldi, oyunlar başlıyor! Doğum günü partime bekliyorum!",
      "Kocaman oldum! Gelin, mumlarımı birlikte üfleyelim.",
    ],
  },
  iftar: {
    zarif: [
      "Bu mübarek ayda sofralarımızı sevdiklerimizle paylaşmak istiyoruz. İftarımıza teşriflerinizi bekleriz.",
      "Rahmet ayının bereketini aynı sofrada paylaşmak dileğiyle iftarımıza buyurun.",
    ],
    sicak: [
      "Bir hurma, bir yudum su ve bol muhabbet... İftar sofralarımıza sizi de bekliyoruz.",
      "Sofralar paylaştıkça bereketlenir. Bu akşam orucumuzu sizinle açmak istiyoruz.",
      "Kapımız açık, sofralarımız hazır. İftarımıza buyurun.",
    ],
    manevi: [
      "Allah rızası için kurduğumuz iftar sofrasında sizleri de aramızda görmek isteriz. Oruçlarınız kabul olsun.",
      "Ramazan'ın rahmeti ve bereketi sofralarımıza dolsun. İftarımıza teşriflerinizi ve dualarınızı bekleriz.",
    ],
  },
  hac: {
    zarif: [
      "Kutsal yolculuğa çıkmadan önce sizlerle vedalaşmak ve dualarınızı almak isteriz.",
      "Hacı adayımızı mübarek topraklara uğurlarken sizleri de aramızda görmekten mutluluk duyarız.",
    ],
    sicak: [
      "Yolculuk öncesi helalleşmek, sarılmak ve dualarınızı almak istiyoruz. Uğurlamamıza buyurun.",
      "Yol uzun, dualar yoldaş. Uğurlamamızda sizi de aramızda görmek istiyoruz.",
    ],
    manevi: [
      "Allah'ın izniyle Beytullah'ı ziyarete gidiyoruz. Yola çıkmadan önce helalleşmek ve dualarınızı almak isteriz.",
      "Rabbim nasip etti, kutsal topraklara gidiyoruz. Uğurlama duamıza teşriflerinizi bekleriz; hakkınızı helal edin.",
    ],
  },
  asker: {
    zarif: [
      "Vatani görevine gidecek evladımızı hep birlikte uğurlamak istiyoruz. Sizi de aramızda görmek isteriz.",
      "Yiğidimizi vatan hizmetine uğurlarken yanımızda olmanız bizim için çok kıymetli.",
    ],
    // Pek çok yörede askere gidene kına yakılır, halay çekilir
    sicak: [
      "Kınası yakılacak, halayı çekilecek, dualarla uğurlanacak... Askerimizi birlikte yolcu edelim.",
      "Yolu açık, bahtı açık olsun! Askerimizi uğurlarken sizi de aramızda görmek istiyoruz.",
    ],
    neseli: [
      "Asker yolu göründü! Son bir gece, bol davul zurna; uğurlamada buluşalım.",
      "Tezkereye kadar görüşemeyeceğiz, son halayı birlikte çekelim!",
    ],
    manevi: [
      "Evladımızı vatani görevine uğurluyoruz. Dualarınızla yanımızda olmanızı isteriz.",
      "Allah'a emanet ettiğimiz yiğidimizi dualarla uğurlamak istiyoruz. Teşriflerinizi bekleriz.",
    ],
  },
  evpartisi: {
    zarif: [
      "Yeni evimizde sizi ağırlamaktan mutluluk duyarız.",
      "Yeni yuvamızın kapısını ilk olarak sevdiklerimize açmak istiyoruz.",
    ],
    sicak: [
      "Yeni evimizin ilk misafiri siz olun! Çayımız demlendi, kapımız açık.",
      "Anahtarı aldık, perdeleri taktık, sıra ev hayırlısında. Sizi bekliyoruz.",
    ],
    neseli: [
      "Kolileri açtık (çoğunu!), şimdi sıra kutlamada. Yeni evimize buyurun!",
      "Adres değişti, muhabbet aynı! Yeni evimizde görüşelim.",
    ],
    manevi: [
      "Yeni evimiz hayırlı olsun diye sevdiklerimizi ağırlamak istiyoruz. Dualarınızla buyurun.",
      "Evimize bereket, gönlümüze huzur dileğiyle sizleri ağırlamak isteriz. Dualarınızı eksik etmeyin.",
    ],
  },
  yemek: {
    zarif: [
      "Güzel bir akşam yemeğinde sizi ağırlamaktan mutluluk duyarız.",
      "Sofraları güzelleştiren sohbettir. Bu akşam sofralarımızı sizinle paylaşmak isteriz.",
    ],
    sicak: [
      "Sofra kuruldu, çay demde, muhabbet hazır. Akşam yemeğine bekliyoruz.",
      "Bir tas çorba, bol sohbet... Bu akşam bizde buluşalım.",
      `${YUNUS} Güzel bir akşam yemeğinde buluşalım.`,
    ],
    neseli: [
      "Yemekler bizden, kahkahalar sizden! Akşam yemeğine bekliyoruz.",
      "Diyetler bir akşamlığına iptal! Sofrada buluşuyoruz.",
    ],
  },
  mezuniyet: {
    zarif: [
      "Emeklerin karşılığını aldığımız bu güzel günü sevdiklerimizle paylaşmak istiyoruz.",
      "Yılların emeği bir diplomada buluştu. Bu gururu sizinle paylaşmak isteriz.",
    ],
    sicak: [
      "Okul bitti, hayat başlıyor! Bu mutluluğu birlikte kutlayalım.",
      "Uykusuz gecelerin, bitmeyen sınavların sonu geldi. Kutlamamızda sizi de görmek istiyoruz.",
    ],
    neseli: [
      "Kepler havaya uçacak, siz de orada olun!",
      "Son sınav bitti, şimdi sıra partide! Mezuniyet kutlamasına bekliyoruz.",
      a("Diploma cepte, sıra kutlamada! Sen de gel, eksik kalmasın."),
    ],
  },
  bulusma: {
    zarif: [
      "Uzun zamandır bir araya gelemedik. Güzel bir buluşmada sizi görmek isteriz.",
      `${YUNUS} Bir araya gelmenin tam vakti.`,
    ],
    sicak: [
      "Özledik! Bir çay içimi, bol muhabbet için buluşalım.",
      "Bir fincan kahvenin kırk yıl hatırı var; hatırımız için gelin, buluşalım.",
    ],
    neseli: [
      "Grup sohbeti yetmez, yüz yüze görüşmek şart! Buluşmada bekliyoruz.",
      "Bahaneler kabul edilmiyor, takvimlerinizi açın! Buluşuyoruz.",
    ],
  },
  genel: {
    zarif: ["Sizi aramızda görmek isteriz. Gelmeniz bizim için değerli."],
    sicak: ["Birlikte olalım istedik. Gelirseniz çok seviniriz."],
    neseli: ["Güzel bir gün olacak, sizi de bekliyoruz!"],
    manevi: ["Sizleri dualarınızla aramızda görmek isteriz."],
  },
};

/** Mevlidin vesilesi tonu belirler; rahmetli anısına kutlama dili hiç kullanılmaz. */
const MEVLID: Record<string, Havuz> = {
  bebek: {
    hepsi: [
      "Bebeğimizin dünyaya gelişine şükür vesilesiyle okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz.",
      "Rabbimizin bize emanet ettiği evladımız için Mevlid-i Şerif okutuyoruz. Dualarınızla aramızda olmanızı dileriz.",
      "Gül kokulu bir mevlid meclisinde bebeğimiz için dua etmek istiyoruz. Şerbetimiz, lokumumuz ve gönlümüz sizi bekliyor.",
    ],
  },
  ev: {
    hepsi: [
      "Yeni evimizin hayırlı olması için okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz.",
      "Yeni yuvamıza bereket, huzur ve sağlık dileğiyle Mevlid-i Şerif okutuyoruz. Dualarınızla aramızda olun.",
      "Evimizin ilk duası sizinle olsun. Mevlidimize buyurun; şerbetimiz, lokumumuz hazır.",
    ],
  },
  rahmetli: {
    hepsi: [
      "Rahmetlimizin ruhuna okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz. Dualarınızla aramızda olmanızı dileriz.",
      "Aramızdan ayrılan kıymetlimizi hayırla yâd etmek için Mevlid-i Şerif okutuyoruz. Fatihalarınızla aramızda olmanızı rica ederiz.",
      "Rahmetlimizin hatırasına okunacak mevlidimizde sizleri de aramızda görmek, birlikte dua etmek isteriz.",
    ],
  },
  sukur: {
    hepsi: [
      "Rabbimize şükür vesilesiyle okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz.",
      "Bize bahşedilen nimetlere şükretmek için Mevlid-i Şerif okutuyoruz. Dualarınızla meclisimize katılın.",
      "Şükrümüzü sevdiklerimizle paylaşmak istiyoruz; Mevlid-i Şerif'imize buyurun.",
    ],
  },
  genel: {
    hepsi: [
      "Okunacak Mevlid-i Şerif'e teşriflerinizi rica ederiz. Dualarınızla aramızda olmanızı dileriz.",
      "Gül kokulu mevlid meclisimizde sizleri de aramızda görmek isteriz.",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Seçim                                                               */
/* ------------------------------------------------------------------ */

export interface SozGirdisi {
  answers: Answers;
  /** Tören dalında çiftin adları, ailelerin ağzından kurulan cümleler için */
  names?: [string, string];
  /** İki ailenin adı yazıldı mı? */
  families?: boolean;
}

const tonOf = (a: Answers): Ton => (TONLAR.includes(a.ton as Ton) ? (a.ton as Ton) : "sicak");

function havuzOf(a: Answers): Havuz {
  const tur = a.tur ?? "";
  if (tur === "dugun") return DUGUN;
  if (tur === "nisan") return NISAN;
  if (tur === "soz") return SOZ;
  if (tur === "mevlid") return MEVLID[a.vesile ?? ""] ?? MEVLID.genel;
  if (tur === "dogumgunu" && a.grup === "cocuk") return ETKINLIK["dogumgunu-cocuk"];
  return ETKINLIK[tur] ?? ETKINLIK.genel;
}

/** Davetlilere göre ayıklama: büyüklere argo gitmez, arkadaşlara ağır resmiyet önde gelmez. */
function uyanlar(list: Cumle[], kim: string) {
  const metin = (c: Cumle) => (typeof c === "string" ? c : c.t);
  const tur = (c: Cumle) => (typeof c === "string" ? "" : c.k);
  if (kim === "buyukler") {
    const resmi = list.filter((c) => tur(c) === "b");
    const kalan = list.filter((c) => tur(c) === "");
    return [...resmi, ...kalan].map(metin);
  }
  if (kim === "arkadaslar") {
    const samimi = list.filter((c) => tur(c) === "a");
    const kalan = list.filter((c) => tur(c) === "");
    const resmi = list.filter((c) => tur(c) === "b");
    return [...samimi, ...kalan, ...resmi].map(metin);
  }
  // Karışık: argo dışarıda, resmî cümleler de uygun
  return list.filter((c) => tur(c) !== "a").map(metin);
}

/**
 * Bu cevaplara uyan bütün metinler, en uygunundan başlayarak. Boş dönmez.
 * Aileler yazıldıysa önce ailelerin ağzından kurulan cümleler gelir.
 */
export function sozSecenekleri({ answers, names, families }: SozGirdisi): string[] {
  const ton = tonOf(answers);
  const havuz = havuzOf(answers);
  const kim = answers.kim ?? "karisik";
  // Seçilen ton bu türde yoksa (ör. mevlid için neşeli) en yakın tona düşülür
  const sira: (Ton | "hepsi")[] = [ton, "hepsi", ton === "manevi" ? "zarif" : "sicak", "sicak", "zarif"];
  let list: string[] = [];
  for (const t of sira) {
    const bulunan = havuz[t];
    if (bulunan?.length) { list = uyanlar(bulunan, kim); if (list.length) break; }
  }

  const aile = AILE_FIIL[answers.tur ?? ""];
  if (families && aile && names?.[0] && names?.[1]) {
    const [fiil, davet] = aile;
    const sesli = AILE_SESI[ton].map((s) =>
      s
        .replaceAll("{A}", names[0])
        .replaceAll("{B}", names[1])
        .replaceAll("{fiil}", fiil)
        .replaceAll("{Davet}", davet.charAt(0).toLocaleUpperCase("tr") + davet.slice(1))
        .replaceAll("{davet}", davet)
    );
    list = [...sesli, ...list];
  }
  return list.length ? list : uyanlar(ETKINLIK.genel.sicak ?? [], kim);
}

/** Metinden türeyen küçük, kararlı sayı: aynı davet her açılışta aynı sırayı görür. */
export function tohum(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Listeyi tohumdan başlayarak döndürür. Aileler varsa ilk sıradaki (ailelerin sesi)
 * korunur, çünkü büyükler davetiyede o dili bekler.
 */
export function sozSirasi(girdi: SozGirdisi, seed: string) {
  const list = sozSecenekleri(girdi);
  const n = tohum(seed) % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
}

/* ------------------------------------------------------------------ */
/* Açılış satırı ve davetliye hitap                                    */
/* ------------------------------------------------------------------ */

/** Kapağın en üstündeki kısa satırın seçenekleri. İlki varsayılan. */
export function acilisSecenekleri(a: Answers): string[] {
  const tur = a.tur ?? "";
  switch (a.ton) {
    case "manevi":
      return ["Allah'ın izniyle", "Bismillahirrahmanirrahim", "Hayırlı olsun"];
    case "sicak":
      return ["Bu mutlu günümüzde", "Sevdiklerimizle birlikte", "Bu sevinç sizinle güzel"];
    case "neseli":
      if (tur === "nisan") return ["Sonunda nişanlanıyoruz!", "Yüzükler takılıyor!", "Evet dedik!"];
      if (tur === "soz") return ["Söz kesildi!", "Sözümüz söz!", "Kahveler içildi!"];
      return ["Sonunda evleniyoruz!", "Evet dedik!", "Büyük gün geldi!"];
    default:
      return ["Mutluluğumuza ortak olun", "Sevgiyle davet ediyoruz", "Bir ömrün ilk günü"];
  }
}

/**
 * Davetliye hitap ve davet cümlesi; tören sayfalarında isimlerin altında durur.
 * greet: "kına gecemizde ve düğünümüzde" gibi (lib/events.ts greetingFor).
 */
export function hitap(ton: string | undefined) {
  if (ton === "zarif") return "Değerli";
  if (ton === "manevi") return "Kıymetli";
  return "Sevgili";
}
export function davetCumlesi(ton: string | undefined, greet: string) {
  switch (ton) {
    case "zarif": return `${greet} sizleri de aramızda görmekten onur duyarız.`;
    case "neseli": return `${greet} siz olmadan olmaz, yeriniz hazır!`;
    case "manevi": return `${greet} hayır dualarınızla aramızda olmanızı dileriz.`;
    default: return `${greet} sizi de aramızda görmek istiyoruz.`;
  }
}

/** Kayıtlı cevap satırından ("tur=dugun&ton=zarif…") cevapları okur. */
export function cevaplarOf(saved: string | null | undefined): Answers {
  const out: Answers = {};
  if (!saved) return out;
  for (const [k, v] of new URLSearchParams(saved)) if (/^[a-z]{2,12}$/.test(k) && /^[a-z]{1,16}$/.test(v)) out[k] = v;
  return out;
}

/* ------------------------------------------------------------------ */
/* Sihirbazdaki ton örnekleri                                          */
/* ------------------------------------------------------------------ */

/**
 * "Davetiniz nasıl konuşsun?" sorusunda her seçeneğin altındaki kısa örnek.
 * Kullanıcı kendi gününün diliyle karar versin diye türe göre değişir:
 * mezuniyette "pistte yeriniz hazır" değil, "kepler havaya uçacak".
 */
const TON_ORNEK: Record<string, Partial<Record<Ton, string>>> = {
  dugun: { zarif: "Sizleri aramızda görmekten onur duyarız.", sicak: "Bu güzel günde yanımızda olmanızı çok isteriz.", neseli: "Pistte yeriniz hazır, kaçmak yok!", manevi: "Allah'ın izniyle… Hayır dualarınızı bekleriz." },
  nisan: { zarif: "Yüzüklerimizi huzurunuzda takmak isteriz.", sicak: "Biz nişanlanıyoruz, buyurun beraber sevinelim!", neseli: "Kurdeleyi kesecek makas hazır!", manevi: "Allah'ın izniyle nişanlanıyoruz." },
  soz: { zarif: "Bir fincan kahvenin kırk yıl hatırı vardır.", sicak: "Tatlı yiyip tatlı konuşalım.", neseli: "Kahve tuzlu da olsa içildi, söz kesildi!", manevi: "Allah'ın emri, Peygamber'in kavliyle…" },
  kina: { zarif: "Gelinimizin kınası yakılacak.", sicak: "Kınalar yakılacak, türküler söylenecek.", neseli: "Çalsın davullar, oynasın kızlar!", manevi: "Allah'ın izniyle kınamız yakılacak." },
  bekarlik: { zarif: "Bekârlığa zarif bir veda.", sicak: "Son bir kez birlikte veda edelim!", neseli: "Bekârlık bitiyor, eğlence bitmiyor!" },
  sunnet: { zarif: "Oğlumuzun sünnet düğününe teşriflerinizi bekleriz.", sicak: "Bir sünnet, bir bayram, bir dua…", neseli: "Büyüdüm artık maşallah, çocukluğuma eyvallah!", manevi: "Allah'ın izniyle oğlumuzu sünnet ettiriyoruz." },
  babyshower: { zarif: "Minik misafirimizi birlikte bekleyelim.", sicak: "Minik ayaklar yolda!", neseli: "Bebek geliyor, parti başlıyor!", manevi: "Allah'ın izniyle minik bir can aramıza katılıyor." },
  cinsiyet: { zarif: "Bu sürprizi sizinle öğrenmek isteriz.", sicak: "Merakımıza ortak olun!", neseli: "Pembe mi, mavi mi? Balonlar patlayınca göreceğiz!" },
  disbugdayi: { zarif: "İlk dişin sevincini paylaşmak isteriz.", sicak: "Minik incimiz göründü!", neseli: "Makas mı, kalem mi? Bebeğimiz mesleğini seçiyor!", manevi: "İlk dişi çıktı, maşallah! Dualarınızı bekleriz." },
  dogumgunu: { zarif: "Yeni yaşı sevdiklerle karşılayalım.", sicak: "Yeni bir yaş, yeni bir sayfa!", neseli: "Mumları saymayın, sadece gelin!" },
  mevlid: { zarif: "Mevlid-i Şerif'e teşriflerinizi rica ederiz.", sicak: "Şerbetimiz, lokumumuz sizi bekliyor.", manevi: "Dualarınızla aramızda olmanızı dileriz." },
  iftar: { zarif: "Sofralarımızı sizinle paylaşmak isteriz.", sicak: "Bir hurma, bir yudum su, bol muhabbet.", manevi: "Oruçlarınız kabul olsun, iftarımıza buyurun." },
  hac: { zarif: "Yola çıkmadan dualarınızı almak isteriz.", sicak: "Helalleşmek, sarılmak istiyoruz.", manevi: "Beytullah'a gidiyoruz; hakkınızı helal edin." },
  asker: { zarif: "Yiğidimizi vatan hizmetine uğurluyoruz.", sicak: "Yolu açık, bahtı açık olsun!", neseli: "Tezkereye kadar yok; son halayı birlikte çekelim!", manevi: "Allah'a emanet, dualarla uğurlayalım." },
  evpartisi: { zarif: "Yeni yuvamızda sizi ağırlamak isteriz.", sicak: "Çayımız demlendi, kapımız açık.", neseli: "Kolileri açtık (çoğunu!), sıra kutlamada!", manevi: "Evimiz hayırlı olsun; dualarınızla buyurun." },
  yemek: { zarif: "Sofralarımızı sizinle paylaşmak isteriz.", sicak: "Sofra kuruldu, çay demde, muhabbet hazır.", neseli: "Diyetler bir akşamlığına iptal!" },
  mezuniyet: { zarif: "Yılların emeği bir diplomada buluştu.", sicak: "Okul bitti, hayat başlıyor!", neseli: "Kepler havaya uçacak, siz de orada olun!" },
  bulusma: { zarif: "Güzel bir buluşmada görüşmek isteriz.", sicak: "Özledik! Bir çay içimi muhabbet.", neseli: "Bahaneler kabul edilmiyor!" },
};

/** Ton seçeneğinin altındaki örnek; tür bilinmiyorsa düğün örnekleri. */
export function tonOrnegi(tur: string | undefined, ton: Ton) {
  const s = (TON_ORNEK[tur ?? ""] ?? TON_ORNEK.dugun)[ton] ?? TON_ORNEK.dugun[ton];
  return s ? `“${s}”` : undefined;
}

/**
 * Sihirbazda tür seçilince görünen karşılık: kullanıcı kendi gününün
 * anlaşıldığını ilk cevapta görür.
 */
export const TUR_TEPKI: Record<string, string> = {
  dugun: "Bir ömür mutluluk! Düğününüze yakışır bir davetiye hazırlayalım.",
  nisan: "Hayırlı olsun! Nişanınıza özel bir davetiye kuruyoruz.",
  soz: "Hayırlı olsun! Tatlı bir söz daveti geliyor.",
  kina: "Kınalar yakılsın! Gecenize yakışan bir davet hazırlıyoruz.",
  bekarlik: "Son özgür gece! Eğlenceli bir davet geliyor.",
  sunnet: "Maşallah! Şehzadenize yakışan bir davet hazırlayalım.",
  babyshower: "Minik ayaklar yolda! Tatlı bir davet geliyor.",
  cinsiyet: "Heyecanlı bir sürpriz! Merak uyandıran bir davet kuralım.",
  disbugdayi: "Maşallah, ilk diş! Buğdaylar kaynasın.",
  dogumgunu: "Nice mutlu yaşlara! Kutlamaya yakışan bir davet hazırlayalım.",
  mevlid: "Allah kabul etsin. Gül kokulu, sade bir davet hazırlayalım.",
  iftar: "Hayırlı Ramazanlar! Sofranıza yakışan bir davet geliyor.",
  hac: "Allah kabul etsin, yolunuz açık olsun.",
  asker: "Yolu açık olsun! Uğurlamaya yakışan bir davet hazırlayalım.",
  evpartisi: "Hayırlı olsun! Yeni evinize ilk misafirleri çağıralım.",
  yemek: "Afiyet olsun şimdiden! Sofranıza davet hazırlıyoruz.",
  mezuniyet: "Tebrikler! Emeklerin kutlanacağı bir davet hazırlayalım.",
  bulusma: "Özlem giderelim! Buluşmaya çağıralım.",
};

/**
 * Kayıtlı bir davet için öneri listesi (düzenleme ekranındaki "Başka metin öner").
 * Eski davetlerde cevap kaydı yok: türü etkinlikten, tonu "sıcak" varsayar.
 */
export function oneriler(saved: string | null | undefined, fallbackTur: string, names?: [string, string], families = false) {
  const answers = cevaplarOf(saved);
  if (!answers.tur && fallbackTur) answers.tur = fallbackTur;
  return sozSecenekleri({ answers, names, families });
}
