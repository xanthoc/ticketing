import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import Router from "next/router";

import useRequest from "../../hooks/useRequest";
import { STRIPE_PUB_KEY } from "../../config/keys";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });
  useEffect(() => {
    const calcTimeLeft = () => {
      const diff = Math.round((new Date(order.expiresAt) - new Date()) / 1000);
      setTimeLeft(diff);
    };
    calcTimeLeft();
    const timerId = setInterval(calcTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);
  if (timeLeft < 0) {
    return <div>Order expired</div>;
  }
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={STRIPE_PUB_KEY}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
