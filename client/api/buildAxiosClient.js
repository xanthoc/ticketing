import axios from "axios";

const buildAxiosClient = ({ req }) => {
  if (typeof window === "undefined") {
    // this is called in a server
    return axios.create({
      headers: req.headers,
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
    });
  } else {
    return axios;
  }
};

export default buildAxiosClient;
