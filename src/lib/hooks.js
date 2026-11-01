import { useEffect, useState } from "react";
import { api } from "./api.js";

export function useFetch(path, params) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const key = path + JSON.stringify(params || {});
  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, { params })
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

// Hero / login / contact banner images are managed in Django admin (SiteImage).
let siteCache;
export function useSiteImages() {
  const [imgs, setImgs] = useState(siteCache || {});
  useEffect(() => {
    if (siteCache) return;
    api("/site-images/").then((d) => { siteCache = d; setImgs(d); }).catch(() => {});
  }, []);
  return imgs;
}