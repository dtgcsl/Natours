import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId, req, res) => {
  const stripe = Stripe(
    'pk_test_51MH2fZIKcWCtIDwm7rNcUDWNz6k1bvfs29OUMAKMNRJMyGCV9ruyxSZpNig7cCrzYzQritxzTxP9w4jj53Uvfhnc00ag1WlT8U'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
