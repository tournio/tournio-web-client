import Card from 'react-bootstrap/Card';

import classes from './TournamentInPrep.module.scss';
import ConfigItemForm from "../ConfigItemForm/ConfigItemForm";
import ErrorBoundary from "../../common/ErrorBoundary";
import {useTournament} from "../../../director";

const Configuration = () => {
  const {tournament} = useTournament();

  if (!tournament) {
    return '';
  }

  // Exclude these from the Configuration panel
  const SKIPPABLE_ITEMS = [
    'bowler_form_fields',
    'stripe_receipts',
    'registration_without_payments',
    'tournament_type',
  ]

  // if we can't accept payments, then there are a few more that we can exclude.
  const relevantItem = tournament.config_items.find(({key}) => key === 'registration_without_payments');
  if (relevantItem && relevantItem.value) {
    SKIPPABLE_ITEMS.push('accept_payments', 'enable_free_entries', 'enable_unpaid_signups', 'skip_stripe');
  }

  return (
    <ErrorBoundary>
      <Card className={`${classes.Card} ${classes.Configuration}`}>
        <Card.Header as={'h5'} className={'fw-light'}>
          Configuration
        </Card.Header>
        <Card.Body className={'px-1'}>
          <dl>
            {tournament.config_items.map((item) => {
              if (SKIPPABLE_ITEMS.includes(item.key)) {
                return null;
              }
              return (
                <ConfigItemForm item={item} key={item.key} editable={true} />
              )
            })}
          </dl>
        </Card.Body>
      </Card>
    </ErrorBoundary>
  );
}

export default Configuration;
