import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Alert, Col, Row} from "react-bootstrap";

import RegistrationLayout from "../../../components/Layout/RegistrationLayout/RegistrationLayout";
import Summary from "../../../components/Registration/Summary/Summary";
import {useRegistrationContext} from "../../../store/RegistrationContext";
import ReviewEntries from "../../../components/Registration/ReviewEntries/ReviewEntries";
import {soloBowlerRegistrationCompleted} from "../../../store/actions/registrationActions";
import {submitSoloRegistration, useClientReady} from "../../../utils";
import ProgressIndicator from "../../../components/Registration/ProgressIndicator/ProgressIndicator";
import LoadingMessage from "../../../components/ui/LoadingMessage/LoadingMessage";
import NewTeamReview from "../../../components/Registration/NewTeamReview/NewTeamReview";
import ErrorAlert from "../../../components/common/ErrorAlert";
import Link from "next/link";
import TournamentHeader from "../../../components/ui/TournamentHeader";
import BowlerSummary from "../../../components/Registration/ReviewEntries/BowlerSummary";

const Page = () => {
  const {registration, dispatch} = useRegistrationContext();
  const router = useRouter();
  const {identifier} = router.query;

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!identifier || !registration || !registration.tournament) {
      return;
    }
    if (!registration.tournament.registration_options.solo) {
      router.push(`/tournaments/${identifier}`);
    }
  }, [registration]);

  // const editBowlerClicked = () => {
  //   router.push(`/tournaments/${registration.tournament.identifier}/solo-bowler-edit`);
  // }

  const ready = useClientReady();
  if (!ready) {
    return (
      <div>
        <LoadingMessage message={'Getting the registration form ready'}/>
      </div>
    );
  }
  if (!registration.tournament) {
    return (
      <div>
        <LoadingMessage message={'Putting everything together...'}/>
      </div>
    );
  }

  const soloRegistrationSuccess = (bowler) => {
    dispatch(soloBowlerRegistrationCompleted());
    setProcessing(false);
    router.push({
      pathname: '/bowlers/[identifier]',
      query: {
        identifier: bowler.identifier,
        success: 1,
      }
    })
  }

  const soloRegistrationFailure = (errorMessage) => {
    setProcessing(false);
    setError(errorMessage);
  }

  const editBowlerClicked = () => {
    router.push(`/tournaments/${identifier}/solo-bowler`);
  }

  const saveClicked = () => {
    // Write the bowler to the backend.
    // Upon success, redirect to the bowler's page, which will
    // present its payment/extras button
    submitSoloRegistration(registration.tournament,
      registration.bowler,
      soloRegistrationSuccess,
      soloRegistrationFailure);
    setProcessing(true);
  }

  return (
    <div>
      <TournamentHeader tournament={registration.tournament}/>

      <h2 className={`text-center`}>
        Review Bowler Details
      </h2>

      <hr/>

      <BowlerSummary bowler={registration.bowler} />

      <hr />

      {error && <ErrorAlert message={error}/> }

      <div className={`d-flex justify-content-between`}>
        <Link href={{
          pathname: '/tournaments/[identifier]/solo-bowler',
          query: {
            identifier: identifier
          }
        }}
              className={`btn btn-lg btn-outline-primary d-block ${processing && 'invisible'}`}>
          <i className={'bi bi-chevron-double-left pe-2'}
             aria-hidden={true}/>
          Make Changes
        </Link>

        <button className={`btn btn-lg btn-primary`}
                disabled={processing}
                onClick={saveClicked}>
          Save
          <i className={'bi bi-chevron-double-right ps-2'}
             aria-hidden={true}/>
        </button>
      </div>

      {processing && <LoadingMessage message={'Submitting registration...'} />}
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <RegistrationLayout>
      {page}
    </RegistrationLayout>
  );
}

export default Page;
