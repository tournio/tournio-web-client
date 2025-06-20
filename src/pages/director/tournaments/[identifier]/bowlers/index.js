import React from "react";
import {useRouter} from "next/router";
import {Col, Row} from "react-bootstrap";

import {useDirectorApi, useModernTournament, useTournament} from "../../../../../director";
import DirectorLayout from "../../../../../components/Layout/DirectorLayout/DirectorLayout";
import BowlerListing from "../../../../../components/Director/BowlerListing/BowlerListing";
import Breadcrumbs from "../../../../../components/Director/Breadcrumbs/Breadcrumbs";
import LoadingMessage from "../../../../../components/ui/LoadingMessage/LoadingMessage";
import ErrorBoundary from "../../../../../components/common/ErrorBoundary";
import SuccessAlert from "../../../../../components/common/SuccessAlert";
import ErrorAlert from "../../../../../components/common/ErrorAlert";

const BowlersIndex = () => {
  const router = useRouter();
  const {identifier, deleteSuccess} = router.query;

  const {loading: tournamentLoading, tournament} = useModernTournament();
  const {loading: bowlersLoading, data: bowlers, error, onDataUpdate: onBowlerUpdate} = useDirectorApi({
    uri: identifier ? `/tournaments/${identifier}/bowlers` : null,
  });

  const bowlerUpdated = (bowler) => {
    const modifiedBowlers = [...bowlers];
    const index = bowlers.findIndex(({identifier}) => identifier === bowler.identifier);
    modifiedBowlers[index] = {...bowler}
    onBowlerUpdate(modifiedBowlers);
  }

  if (tournamentLoading || bowlersLoading) {
    return <LoadingMessage message={'Retrieving bowler data...'} />
  }

  if (!tournament || !bowlers) {
    return <LoadingMessage message={'Making sense of bowler data...'} />
  }

  ////////////////////

  const ladder = [{text: 'Tournaments', path: '/director'}];
  ladder.push({text: tournament.name, path: `/director/tournaments/${identifier}`});

  const showTeams = tournament.events.some(({rosterType}) => rosterType === 'team');

  return (
    <ErrorBoundary>
      <Breadcrumbs ladder={ladder} activeText={'Bowlers'}/>
      <Row>
        <Col>
          {deleteSuccess && (
            <SuccessAlert message={'The bowler has been removed.'}
                          onClose={() => router.replace(`/director/tournaments/${identifier}/bowlers`, null, {shallow: true})}/>
          )}
          {error && (
            <ErrorAlert message={error.message} className={'mx-3 mt-3'}/>
          )}
          <BowlerListing bowlers={bowlers}
                         showTeams={showTeams}
                         showMoney={!tournament.config.registration_without_payments}
                         onBowlerUpdate={bowlerUpdated} />
        </Col>
      </Row>
    </ErrorBoundary>
  );
}

BowlersIndex.getLayout = function getLayout(page) {
  return (
    <DirectorLayout>
      {page}
    </DirectorLayout>
  );
}

export default BowlersIndex;
