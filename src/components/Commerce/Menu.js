import {useCommerceContext} from "../../store/CommerceContext";
import {itemAddedToCart, itemRemovedFromCart} from "../../store/actions/registrationActions";

import PreviousPurchases from "./PreviousPurchases/PreviousPurchases";
import AvailableItems from "./AvailableItems/AvailableItems";
import Cart from "./Cart/Cart";

import classes from './Menu.module.scss';

const Menu = ({signupChanged}) => {
  const {commerce, dispatch} = useCommerceContext();

  if (!commerce || !commerce.bowler) {
    return '';
  }

  const itemAdded = (item, sizeIdentifier = null) => {
    dispatch(itemAddedToCart(item, sizeIdentifier));
  }

  const itemRemoved = (item) => {
    dispatch(itemRemovedFromCart(item));
  }

  return (
    <div className={classes.Menu}>
      <div className={`row`}>
        <AvailableItems itemAddedToCart={itemAdded}
                        signupChanged={signupChanged}
        />
        <div className={`col ${classes.CartContainer}`}
             id={'cart'}>
          <Cart itemAddedToCart={itemAdded}
                itemRemovedFromCart={itemRemoved}/>

          <hr className={`mt-0 mb-3 mt-md-3`}/>

          <PreviousPurchases/>

          <p className={`d-md-none mt-5`}>
            Looking for your cart? It&apos;s up at the top right
            <i className={'bi bi-arrow-up ps-2'} aria-hidden={true}/>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Menu;
