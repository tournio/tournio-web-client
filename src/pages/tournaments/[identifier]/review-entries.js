import {useState} from "react";
import {useRouter} from "next/router";
import {Alert, Col, Row} from "react-bootstrap";

import InformationLayout from "../../../components/Layout/InformationLayout/InformationLayout";
import Summary from "../../../components/Registration/Summary/Summary";
import ProgressIndicator from "../../../components/Registration/ProgressIndicator/ProgressIndicator";
import {useRegistrationContext} from "../../../store/RegistrationContext";
import ReviewEntries from "../../../components/Registration/ReviewEntries/ReviewEntries";
import {devConsoleLog, submitNewTeamRegistration, useClientReady, useTournament} from "../../../utils";
import {newTeamEntryCompleted} from "../../../store/actions/registrationActions";
import LoadingMessage from "../../../components/ui/LoadingMessage/LoadingMessage";

const Page = () => {
  devConsoleLog("------------ page untouched in team restoration");
  const {registration, dispatch} = useRegistrationContext();
  const router = useRouter();
  const {identifier} = router.query;

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const {loading: tournamentLoading, tournament, error: tournamentError} = useTournament(identifier);

  const editBowlerClicked = (bowlerIndex) => {
    router.push(`/tournaments/${tournament.identifier}/edit-new-team-bowler?bowler=${bowlerIndex+1}`)
  }

  const newTeamRegistrationSuccess = (teamData) => {
    dispatch(newTeamEntryCompleted());
    router.push(`/teams/${teamData.identifier}?success=new_team`);
  }

  const newTeamRegistrationFailure = (errorMessage) => {
    setProcessing(false);
    setError(errorMessage);
  }

  const submitRegistration = (event) => {
    event.preventDefault();

    if (event.target.elements) {
      // got a partial team with a checkbox in a form
      registration.team.placeWithOthers = event.target.elements.placeWithOthers.checked;
    }

    submitNewTeamRegistration(tournament,
      registration.team,
      newTeamRegistrationSuccess,
      newTeamRegistrationFailure);
    setProcessing(true);
  }

  const ready = useClientReady();
  if (!ready) {
    return null;
  }
  if (!registration) {
    return '';
  }

  let errorMessage = '';
  let output = '';
  if (error) {
    errorMessage = (
      <Alert variant={'danger'}>
        <h1 className={'display-6 text-center text-danger'}>Well, that was unexpected...</h1>
        <p className={'text-center'}>{error}</p>
      </Alert>
    );
  }
  if (processing) {
    output = <LoadingMessage message={'Submitting registration...'} />;
  } else {
    output = (
      <div className={'border-bottom mb-3 mb-sm-0'}>
        <ProgressIndicator active={'review'} />
        {errorMessage}
        <ReviewEntries editBowler={editBowlerClicked} tournament={tournament} />
      </div>
    )
  }

  return (
    <Row>
      <Col lg={8}>
        {output}
      </Col>
      <Col>
        <Summary tournament={tournament}
                 nextStepClicked={submitRegistration}
                 nextStepText={'Submit Registration'}
                 enableDoublesEdit={true}
                 finalStep={true}
        />
      </Col>
    </Row>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <InformationLayout>
      {page}
    </InformationLayout>
  );
}

export default Page;
