import Router from 'next/router';
import { useEffect, useState } from 'react';
import useRequest from '../../hooks/use-request';
import StripeCheckout from 'react-stripe-checkout';

const orderShow = ({ order, currentUser }) => {
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push('/orders'),
  });
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired </div>;
  }

  return (
    <div>
      <h1>{order.ticket.title}</h1>
      <h2>Time left to pay: {timeLeft} seconds</h2>
      {errors}
      <StripeCheckout
        token={({ id }) => {
          doRequest({ token: id });
        }}
        stripeKey="pk_test_51KRyt5HFXXNaLEcr04u0gEq75xwSVHLIbSTISMBrtKidG32phTHzxZE2yF7JX0WprrhV02BqLIQeeoSO166yNlSL00I53wZ6oy"
        amount={order.ticket.price}
        email={currentUser.email}
      />
    </div>
  );
};

orderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  console.log(data);
  return { order: data };
};

export default orderShow;
