import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "../NProgress/NProgress.css";

NProgress.configure({ showSpinner: false });

export const startProgress = () => NProgress.start();
export const stopProgress = () => NProgress.done();
