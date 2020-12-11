import "bootstrap/dist/css/bootstrap.css";
import buildAxiosClient from "../api/buildAxiosClient";
import Header from "../components/Header";

const _App = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

_App.getInitialProps = async ({ Component, ctx }) => {
  const client = buildAxiosClient(ctx);
  const { data } = await client.get("/api/users/currentuser");
  let pageProps;
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx, client, data.currentUser);
  }
  return { pageProps, ...data };
};

export default _App;
