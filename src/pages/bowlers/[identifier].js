import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import {Col, Row} from "react-bootstrap";

import {apiHost, devConsoleLog, updateObject, useBowlerCommerce} from "../../utils";
import {useCommerceContext} from "../../store/CommerceContext";
import Menu from '../../components/Commerce/Menu';
import LoadingMessage from "../../components/ui/LoadingMessage/LoadingMessage";
import FreeEntryForm from "../../components/Commerce/FreeEntryForm/FreeEntryForm";
import CommerceLayout from "../../components/Layout/CommerceLayout/CommerceLayout";
import SuccessAlert from "../../components/common/SuccessAlert";
import ErrorAlert from "../../components/common/ErrorAlert";
import TournamentHeader from "../../components/ui/TournamentHeader";
import {commerceDetailsRetrieved, signupableStatusUpdated} from "../../store/actions/registrationActions";
import axios from "axios";

const Page = () => {
  const router = useRouter();
  const {identifier, success, error} = router.query;
  const {commerce, dispatch} = useCommerceContext();

  const [state, setState] = useState({
    successMessage: null,
    errorMessage: null,
  });

  const onFetchFailure = (response) => {
    if (response.status === 404) {
      // dispatch(bowlerCommerceDetailsMooted());
      router.push('/404');
    }
    setState({
      ...state,
      errorMessage: response,
    })
  }

  const onFetchSuccess = (response) => {
    if (!response) {
      devConsoleLog("No response object in commerce fetch success, for some reason", identifier);
      return;
    }
    // initialize the reducer for this bowler, but only if they aren't in context yet
    if (commerce && (!commerce.bowler || commerce.bowler.identifier !== identifier)) {
      devConsoleLog("New bowler for context!", response);
      dispatch(commerceDetailsRetrieved({...response}));
    }
  }

  const {loading, data, commerceUpdated} = useBowlerCommerce(identifier, onFetchSuccess, onFetchFailure);

  useEffect(() => {
    const updatedState = {...state};
    switch (success) {
      case '1':
        updatedState.successMessage = 'Registration successful!';
        break;
      case '2':
        updatedState.successMessage = 'Your purchase is complete.';
        commerceUpdated();
        break;
      default:
        break;
    }
    switch (error) {
      case '1':
        updatedState.errorMessage = 'Checkout was not successful';
        break;
    }

    setState(updateObject(state, updatedState));
  }, [success, error]);

  if (loading) {
    return <LoadingMessage message={'One moment, please...'}/>;
  }

  if (!data) {
    return <LoadingMessage message={'Almost ready...'}/>;
  }

  const clearSuccessMessage = () => {
    setState(updateObject(state, {
      successMessage: null,
    }));
  }

  const clearErrorMessage = () => {
    setState(updateObject(state, {
      errorMessage: null,
    }));
  }

  // @refactor This should make use of useApi, or a wrapper function, rather than making the request
  // using Axios directly.
  const signupableUpdated = (identifier, event, onSuccess = () => {}, onFailure = () => {}) => {
    const requestConfig = {
      method: 'patch',
      url: `${apiHost}/signups/${identifier}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: {
        bowler_identifier: bowler.identifier,
        event: event,
      },
      validateStatus: (status) => {
        return status < 500
      },
    }
    axios(requestConfig)
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          onSuccess(response.data);
          dispatch(signupableStatusUpdated(identifier, response.data.signupStatus));
        } else {
          onFailure(response.data);
        }
      })
      .catch(error => {
        onFailure({error: error.message});
      });
  }

  const {bowler, team, tournament} = data;

  const registeringWithoutPayments = tournament.config.registration_without_payments;

  let displayFreeEntryForm = !registeringWithoutPayments && tournament.config.enable_free_entries;
  if (commerce.freeEntry && commerce.freeEntry.uniqueCode) {
    displayFreeEntryForm = false;
  }
  if (commerce.purchasedItems.some(item => item.purchasableItem.determination === 'entry_fee')) {
    displayFreeEntryForm = false;
  }

  let successSupplement = ' You may now select events, extras, and pay entry fees.';
  if (registeringWithoutPayments) {
    successSupplement = ' We look forward to seeing you.';
  }

  return (
    <div>
      <Row>
        <Col>
          <TournamentHeader tournament={tournament}/>
        </Col>
      </Row>

      <Row className={`pb-2`}>
        <Col >
          <h3 className={``}>
            Bowler: <strong>{bowler.fullName}</strong>
          </h3>
          {team && (
            <h4 className={``}>
              Team:&nbsp;
              <strong>
                <Link href={{
                  pathname: '/tournaments/[identifier]/teams/[teamIdentifier]',
                  query: {
                    identifier: tournament.identifier,
                    teamIdentifier: team.identifier,
                  }}}>
                  {team.name}
                </Link>
              </strong>
            </h4>
          )}
        </Col>

        <Col md={{offset: 0, span: 5}} lg={{offset: 0, span: 4}}>
          <div className={'d-flex flex-column h-100 justify-content-center mb-3'}>
            {displayFreeEntryForm && <FreeEntryForm/>}
            {/* maybe show the free entry code here if they have one? */}
            {/* paid items go in here */}
          </div>
        </Col>
      </Row>

      <SuccessAlert className={``}
                    message={state.successMessage + successSupplement}
                    onClose={clearSuccessMessage}/>
      <ErrorAlert className={``}
                  message={state.errorMessage}
                  onClose={clearErrorMessage}/>

      {!registeringWithoutPayments && <Menu signupChanged={signupableUpdated}/>}
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <CommerceLayout>
      {page}
    </CommerceLayout>
  );
}

export default Page;
