import {useState, useEffect} from "react";
import Card from 'react-bootstrap/Card';
import Link from "next/link";

import ErrorBoundary from "../../common/ErrorBoundary";
import {directorApiRequest, useTournament} from "../../../director";
import {useLoginContext} from "../../../store/LoginContext";
import {devConsoleLog, updateObject} from "../../../utils";

import classes from './StripeStatus.module.scss';

const StripeStatus = ({needStatus}) => {
  const {authToken} = useLoginContext();
  const {tournament, tournamentUpdatedQuietly} = useTournament();

  // If needStatus is set, then we need to request the Stripe status from the server
  // Otherwise, show a button that can trigger an on-demand status check

  const [errorMessage, setErrorMessage] = useState();
  const [stripeAccount, setStripeAccount] = useState();
  const [statusRequested, setStatusRequested] = useState(false);

  const onStatusFetchSuccess = (data) => {
    setStripeAccount(data);
    setStatusRequested(false);
    const previousStatus = tournament.stripe_account.can_accept_payments;
    if (!data.can_accept_payments && needStatus) {
      devConsoleLog("Can't accept payments, requesting status again soon.");
      setTimeout(initiateStatusRequest, 3000);
    } else {
      devConsoleLog("We can accept payments, so we're good.");
      if (data.can_accept_payments !== previousStatus) {
        const modifiedTournament = updateObject(tournament, {
          stripe_account: {...data},
        });
        tournamentUpdatedQuietly(modifiedTournament);
      }
    }
  }

  const onStatusFetchFailure = (data) => {
    console.log('Failed to check Stripe status.');
    setStatusRequested(false);
    setErrorMessage(data.error);
  }

  const initiateStatusRequest = (event = null) => {
    if (event) {
      event.preventDefault();
    }
    const uri = `/tournaments/${tournament.identifier}/stripe_status`;
    const requestConfig = {
      method: 'get',
    };
    setStatusRequested(true);
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: onStatusFetchSuccess,
      onFailure: onStatusFetchFailure,
    });
  }

  useEffect(() => {
    if (!tournament) {
      return;
    }

    setStripeAccount(tournament.stripe_account);

    if (!needStatus) {
      return;
    }

    if (tournament.stripe_account && !tournament.stripe_account.can_accept_payments) {
      initiateStatusRequest();
    }
  }, [tournament, needStatus]);

  if (!tournament) {
    return '';
  }

  const relevantItem = tournament.config_items.find(({key}) => key === 'registration_without_payments');
  const registeringWithoutPayments = relevantItem && relevantItem.value;

  if (registeringWithoutPayments) {
    return (
      <Card border={'info'} className={`${classes.StripeStatus}`}>
        <Card.Body>
          Registration will not be connected to Stripe.
        </Card.Body>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <Card className={`${classes.StripeStatus}`}>
        <Card.Header as={'h5'} className={'fw-light'}>
          Payment Integration
        </Card.Header>
        <Card.Body>
          {errorMessage && (
            <div className={'alert alert-danger alert-dismissible fade show d-flex align-items-center'}
                 role={'alert'}>
              <i className={'bi-check2-circle pe-2'} aria-hidden={true}/>
              <div className={'me-auto'}>
                {errorMessage}
                <button type="button"
                        className={"btn-close"}
                        data-bs-dismiss="alert"
                        onClick={() => setErrorMessage(null)}
                        aria-label="Close"/>
              </div>
            </div>
          )}
          {stripeAccount && (
            <div className={'d-flex justify-content-center mb-3'}>
              <span className={'pe-3'}>
                Ready to accept payments?
              </span>
              {stripeAccount.can_accept_payments && (
                <span className={`text-success ${classes.Ready}`}>
                <i className={'bi-check-lg'} aria-hidden={true}/>
                <span className={'visually-hidden'}>
                  Yes
                </span>
              </span>
              )}
              {!stripeAccount.can_accept_payments && (
                <span className={`text-danger ${classes.NotReady}`}>
                  <i className={'bi-x-lg'} aria-hidden={true}/>
                  <span className={'visually-hidden'}>
                    No
                  </span>
                </span>
              )}
            </div>
          )}
          <div className={'d-flex justify-content-around'}>
            {stripeAccount && !stripeAccount.can_accept_payments && (
              <Link href={`/director/tournaments/${tournament.identifier}/stripe_account_setup`}
                 className={`btn btn-success`}>
                Resume Setup
              </Link>
            )}
            {!stripeAccount && (
              <Link href={`/director/tournaments/${tournament.identifier}/stripe_account_setup`}
                 className={`btn btn-success`}>
                Begin Setup
              </Link>
            )}
            {!statusRequested && (
              <button onClick={initiateStatusRequest}
                      className={`btn btn-outline-secondary`}>
                Refresh Status
              </button>
            )}
            {statusRequested && (
              <button disabled
                      className={`btn btn-secondary`}>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Checking
              </button>
            )}
          </div>
          <div className={'pt-3 d-flex justify-content-center'}>
            <a href={'https://dashboard.stripe.com/dashboard'}
               className={'btn btn-outline-success'}
               target={'_new'}>
              Stripe dashboard
              <i className={`${classes.ExternalLink} bi-box-arrow-up-right`} aria-hidden={true} />
            </a>
          </div>
        </Card.Body>
      </Card>
    </ErrorBoundary>
  );
}

export default StripeStatus;
