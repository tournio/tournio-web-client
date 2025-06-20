import Button from 'react-bootstrap/Button';

import classes from './TournamentInPrep.module.scss';
import ErrorBoundary from "../../common/ErrorBoundary";
import {useLoginContext} from "../../../store/LoginContext";
import {useTournament} from "../../../director";

const StateChangeButton = ({stateChangeInitiated}) => {
  const {ready, user} = useLoginContext();

  const {loading, tournament} = useTournament();

  if (loading || !tournament || !ready || !user) {
    return '';
  }

  const relevantItem = tournament.config_items.find(({key}) => key === 'registration_without_payments');
  const registeringWithoutPayments = relevantItem && relevantItem.value;

  const unmetTestingCriteria = [];
  const unmetOpeningCriteria = [];

  if (!registeringWithoutPayments) {
    if (!tournament.stripe_account || !tournament.stripe_account.can_accept_payments) {
      unmetTestingCriteria.push('Payment Integration');
      unmetOpeningCriteria.push('Payment Integration');
    }
    if (!tournament.purchasable_items.some(item => item.determination === 'entry_fee' || item.determination === 'event')) {
      unmetTestingCriteria.push('Entry fee or main event');
      unmetOpeningCriteria.push('Entry fee or main event');
    }
  }

  if (!tournament.image_url) {
    unmetTestingCriteria.push('Logo image');
    unmetOpeningCriteria.push('Logo image');
  }
  if (tournament.contacts.length === 0) {
    unmetTestingCriteria.push('Contacts (director, treasurer, etc)');
    unmetOpeningCriteria.push('Contacts (director, treasurer, etc)');
  }
  if (!tournament.shifts || tournament.shifts.length === 0) {
    unmetTestingCriteria.push('Capacity & registration options');
    unmetOpeningCriteria.push('Capacity & registration options');
  }
  if (tournament.bowler_count > 0 || tournament.team_count > 0) {
    unmetOpeningCriteria.push('Clear test data');
  }

  let variant = '';
  let stateChangeText = '';
  let stateChangeValue = '';
  let titleText = '';
  let disabled = false;
  let demoButton = '';
  switch (tournament.state) {
    case 'setup':
      disabled = unmetTestingCriteria.length > 0;
      if (disabled) {
        titleText = (
          <>
            <p>
              The following items must be configured before testing can begin:
            </p>
            <ul>
              {unmetTestingCriteria.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </>
        );
      }
      variant = 'warning';
      stateChangeText = 'Begin Testing';
      stateChangeValue = 'test';

      if (user.role === 'superuser') {
        demoButton = (
          <button className={'btn btn-primary'}
                  type={'button'}
                  onClick={() => demoStateChangeHandler('demonstrate')}
                  role={'button'}>
            Enable Demo
          </button>
        );
      }
      break;
    case 'testing':
      disabled = unmetOpeningCriteria.length > 0;
      if (disabled) {
        titleText = (
          <>
            <p>
              The following items must be configured before registration can be opened:
            </p>
            <ul>
              {unmetOpeningCriteria.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </>
        );
      }
      variant = 'success';
      stateChangeText = 'Open Registration';
      stateChangeValue = 'open';
      break;
    case 'demo':
      if (user.role === 'superuser') {
        demoButton = (
          <button className={'btn btn-outline-danger'}
                  type={'button'}
                  role={'button'}
                  onClick={() => demoStateChangeHandler('reset')}>
            Reset Demo
          </button>
        )
      }
      break;
  }

  const stateChangeSubmitHandler = (event) => {
    event.preventDefault();
    if (confirm("This step is irreversible. Are you sure?")) {
      stateChangeInitiated(event.target.children.state_action.value);
    }
  }

  const demoStateChangeHandler = (newState) => {
    if (confirm("This can't be undone. Are you sure?")) {
      stateChangeInitiated(newState);
    }
  }

  let stateChangeButton = '';
  if (variant || demoButton) {
    stateChangeButton = (
      <ErrorBoundary>
        <div className={classes.StateChange}>
          <form onSubmit={stateChangeSubmitHandler}>
            <input type={'hidden'} name={'state_action'} value={stateChangeValue} />
            <Button variant={variant}
                    disabled={disabled}
                    title={titleText}
                    type={'submit'}>
              {stateChangeText}
            </Button>
            {titleText && <div className={`${classes.WhyDisabledText} text-muted pt-3`}>{titleText}</div> }
          </form>
          {demoButton && (
            <div className={'d-flex justify-content-center mt-3'}>
              {demoButton}
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }

  return stateChangeButton;
}

export default StateChangeButton;
