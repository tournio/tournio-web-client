import Card from 'react-bootstrap/Card';
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";

import PurchasableItemEditForm from "../PurchasableItemEditForm/PurchasableItemEditForm";
import NewPurchasableItem from "../NewPurchasableItem/NewPurchasableItem";
import ErrorBoundary from "../../common/ErrorBoundary";
import {apparelSizes} from "../../../utils";
import {useTournament} from "../../../director";

import classes from './TournamentInPrep.module.scss';

const PurchasableItems = () => {
  const {tournament, tournamentUpdatedQuietly} = useTournament();

  const sortByOrder = (left, right) => {
    let leftOrder = left.configuration.order || 100;
    let rightOrder = right.configuration.order || 100;
    return leftOrder - rightOrder;
  }

  const keyedApparelItemStarter = () => {
    const parentStarter = {
      configuration: {
        sizes: {
          one_size_fits_all: false,
        },
      },
    }
    // To ensure we get a deep copy of the initial size map
    for (const group in apparelSizes) {
      parentStarter.configuration.sizes[group] = {
        ...apparelSizes[group]
      };
    }
    return parentStarter;
  }

  if (!tournament) {
    return '';
  }

  // if we can't accept payments, then we should display no component here.
  const relevantItem = tournament.config_items.find(({key}) => key === 'registration_without_payments');
  const registeringWithoutPayments = relevantItem && relevantItem.value;

  if (registeringWithoutPayments) {
    return '';
  }

  ////////////////////////////

  const ledgerItems = tournament.purchasable_items.filter(item => {
    return item.category === 'ledger'
  }).sort((left, right) => {
    const leftText = !!left.determination ? left.determination : '';
    const rightText = !!right.determination ? right.determination : '';
    return leftText.localeCompare(rightText);
  });

  const eventItems = tournament.purchasable_items.filter(({determination}) => determination === 'event').sort((left, right) => {
    return left.configuration.order - right.configuration.order;
  });

  // sort the division items by name and note
  const divisionItems = tournament.purchasable_items.filter(item => {
    return item.determination === 'single_use' && item.refinement === 'division';
  }).sort((left, right) => {
    const leftText = left.name + left.configuration.division;
    const rightText = right.name + right.configuration.division;
    return leftText.localeCompare(rightText);
  });

  const divisionGroups = new Map();
  divisionItems.forEach((item) => {
    const name = item.name;
    if (!divisionGroups.has(name)) {
      divisionGroups.set(name, []);
    }
    const currentSet = divisionGroups.get(name);
    divisionGroups.set(name, currentSet.concat(item));
  });

  // sort the sanction items by their order
  const sanctionItems = tournament.purchasable_items.filter(item => {
    return item.category === 'sanction' && !item.refinement;
  }).sort(sortByOrder);

  // sort the single_use items by their order
  const singleUseItems = tournament.purchasable_items.filter(item => {
    return item.determination === 'single_use' && item.refinement !== 'division';
  }).sort(sortByOrder);

  // sort the multi-use items by their order
  const multiUseItems = tournament.purchasable_items.filter(item => {
    return item.determination === 'multi_use';
  }).sort(sortByOrder);

  // sort the raffle items by their order
  const raffleItems = tournament.purchasable_items.filter(item => {
    return item.category === 'raffle';
  }).sort(sortByOrder);

  // sort the banquet items by their order
  const banquetItems = tournament.purchasable_items.filter(item => {
    return item.category === 'banquet';
  }).sort(sortByOrder);

  // Gather apparel products by their parent, with sizes as a list
  const keyedApparelProducts = {};

  // apart from the full PI details, mapped by identifier, we add:
  //   configuration: { sizes: { sizeGroup: { size: true } } }
  for (const pi of tournament.purchasable_items) {
    if (pi.category !== 'product' || pi.determination !== 'apparel') {
      continue;
    }

    // it's a parent of potentially many sizes
    if (pi.refinement === 'sized') {
      // is this the first we're seeing of the parent or its kids?
      if (typeof keyedApparelProducts[pi.identifier] === 'undefined') {
        keyedApparelProducts[pi.identifier] = keyedApparelItemStarter();
      }
      const itemConfig = {
        ...pi.configuration,
        ...keyedApparelProducts[pi.identifier].configuration,
      }
      keyedApparelProducts[pi.identifier] = {
        ...pi, // to the existing PI, we add...
        ...keyedApparelProducts[pi.identifier], // what we've gathered here so far (just availableSizes for now)
        configuration: itemConfig,
      }
    } else if (pi.configuration.parent_identifier) {
      // it's one of the sizes
      const parentIdentifier = pi.configuration.parent_identifier;

      // If we're seeing a child size but haven't gotten to the parent yet...
      if (typeof keyedApparelProducts[parentIdentifier] == 'undefined') {
        keyedApparelProducts[parentIdentifier] = keyedApparelItemStarter();
      }
      const sizeParts = pi.configuration.size.split('.');
      keyedApparelProducts[parentIdentifier].configuration.sizes[sizeParts[0]][sizeParts[1]] = true;
    } else {
      // an apparel item in one size
      const sizes = { one_size_fits_all: true };
      for (const group in apparelSizes) {
        if (group === 'one_size_fits_all') {
          continue;
        }
        sizes[group] = {
          ...apparelSizes[group]
        };
      }

      keyedApparelProducts[pi.identifier] = {
        ...pi, // to the existing PI, we add...
        configuration: {
          ...pi.configuration,
          sizes: sizes,
        },
      }
    }
  }

  const apparelItems = Object.values(keyedApparelProducts);

  // sort the non-apparel product items by their order
  const products = tournament.purchasable_items.filter(item => {
    return item.category === 'product' && item.determination === 'general';
  }).sort(sortByOrder);

  const groupValues = [...divisionGroups.values()];

  return (
    <ErrorBoundary>
      <Card className={[classes.Card, classes.PurchasableItems].join(' ')}>
        <Card.Header as={'h5'} className={'fw-light'}>
          Fees and Optional Items
        </Card.Header>

        {(!tournament.stripe_account || !tournament.stripe_account.can_accept_payments) && (
          <Card.Body className={'text-secondary text-center small'}>
            Payment Integration must be set up before adding fees or events/items.
          </Card.Body>
        )}

        {tournament.stripe_account && tournament.stripe_account.can_accept_payments && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            {ledgerItems.length > 0 && (
              <Card.Body className={classes.Category}>
                {ledgerItems.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                    onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                    item={item}/>)}
              </Card.Body>
            )}

            {eventItems.length > 0 && (
              <Card.Body className={classes.Category}>
                {eventItems.map(item => <PurchasableItemEditForm key={item.identifier}
                                                                 onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                 item={item}/>)}
              </Card.Body>
            )}

            {groupValues.map((group, index) => {
              return group.length > 0 && (
                <Card.Body key={index} className={classes.Category}>
                  {group.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                item={item}/>)}
                </Card.Body>
              );
            })}

            {singleUseItems.length > 0 &&
              <Card.Body className={classes.Category}>
                {singleUseItems.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                       onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                       item={item}/>)}
              </Card.Body>
            }

            {multiUseItems.length > 0 &&
              <Card.Body className={classes.Category}>
                {multiUseItems.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                      onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                      item={item}/>)}
              </Card.Body>
            }

            {raffleItems.length > 0 &&
              <Card.Body className={classes.Category}>
                {raffleItems.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                    onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                    item={item}/> )}
              </Card.Body>
            }

            {banquetItems.length > 0 &&
              <Card.Body className={classes.Category}>
                {banquetItems.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                     onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                     item={item}/> )}
              </Card.Body>
            }

            {apparelItems.length > 0 &&
              <Card.Body className={classes.Category}>
                {apparelItems.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                     onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                     item={item}/> )}
              </Card.Body>
            }

            {products.length > 0 &&
              <Card.Body className={classes.Category}>
                {products.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                 onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                 item={item}/>)}
              </Card.Body>
            }

            {sanctionItems.length > 0 &&
              <Card.Body className={classes.Category}>
                {sanctionItems.map((item) => <PurchasableItemEditForm key={item.identifier}
                                                                      onUpdate={(t) => tournamentUpdatedQuietly(t)}
                                                                      item={item}/>)}
              </Card.Body>
            }

            <Card.Body className={classes.Category}>
              <NewPurchasableItem/>
            </Card.Body>
          </LocalizationProvider>
        )}
      </Card>
    </ErrorBoundary>
  );
}

export default PurchasableItems;
