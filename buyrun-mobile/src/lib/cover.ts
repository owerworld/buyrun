import { API_URL } from "./api";
import { covers, type CoverId } from "./theme";

/**
 * Etkinliğin kapak görseli: önce kullanıcının kendi seçtiği görsel, sonra
 * sihirbazın önerdiği telifsiz fotoğraf (sunucudan, /foto/<id>.jpg), yoksa
 * uygulamanın çizim kapağı.
 */
export function coverSource(e: {
  coverId: string;
  coverData?: string | null;
  photoId?: string;
}) {
  if (e.coverData) return { uri: e.coverData };
  if (e.photoId && API_URL && /^[a-z]+-\d{1,2}$/.test(e.photoId))
    return { uri: `${API_URL}/foto/${e.photoId}.jpg` };
  return (covers[e.coverId as CoverId] || covers.cherry).image;
}
