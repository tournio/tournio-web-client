import {useRouter} from "next/router";
import InformationLayout from "../../../../components/Layout/InformationLayout/InformationLayout";
import {useEffect, useState} from "react";
import LoadingMessage from "../../../../components/ui/LoadingMessage/LoadingMessage";
import UrlShare from "../../../../components/ui/UrlShare/UrlShare";
import {updateObject, useTeam, useTheTournament} from "../../../../utils";
import ErrorAlert from "../../../../components/common/ErrorAlert";
import Link from "next/link";
import TournamentLogo from "../../../../components/Registration/TournamentLogo/TournamentLogo";
import SuccessAlert from "../../../../components/common/SuccessAlert";

const Page = () => {
  const router = useRouter();
  const {identifier, teamIdentifier, success} = router.query;

  const [state, setState] = useState({
    currentLocation: null,
    successMessage: null,
  });

  useEffect(() => {
    setState(updateObject(state, {
      currentLocation: window.location,
      successMessage: success ? 'Registration successful!' : '',
    }));
  }, [success]);

  const {loading: teamLoading, team, error: fetchError} = useTeam(teamIdentifier);
  const {loading: tournamentLoading, tournament, error: tournamentError} = useTheTournament(identifier);

  if (teamLoading || tournamentLoading) {
    return (
      <div>
        <LoadingMessage message={'Retrieving team details'}/>
      </div>
    );
  }

  if (fetchError || tournamentError) {
    return (
      <div>
        <ErrorAlert message={'Failed to load team.'}/>
      </div>
    );
  }

  if (!tournament || !team || !team.bowlers) {
    return '';
  }

  //////////////////////////

  const clearSuccessMessage = () => {
    setState(updateObject(state, {
      successMessage: null,
    }));
  }

  const port = process.env.NODE_ENV === 'development' ? `:${state.currentLocation.port}` : '';
  const shareUrl = `${state.currentLocation.protocol}//${state.currentLocation.hostname}${port}/teams/${teamIdentifier}`;

  const tournamentType = tournament.config.tournament_type;

  const registeringWithoutPayments = tournament.config.registration_without_payments;

  const rows = Array(tournament.config['team_size']);
  let firstAvailablePosition = 0;
  for (let i = 0; i < tournament.config['team_size']; i++) {
    const currentPosition = i + 1;
    const bowler = team.bowlers.find(({position}) => position === currentPosition);
    let row = '';
    if (bowler) {
      row = (
        <div className={'d-flex align-items-center py-2 tournio-striped-list-item'} key={`row${i}`}>
          <div className={'ps-2'}>
            {bowler.position}.
          </div>
          <div className={'ps-3'}>
            {bowler.fullName}
          </div>
          {!registeringWithoutPayments && (
            <div className={'ms-auto pe-2'}>
              <Link className={`btn btn-sm btn-success`}
                    title={'Pay entry fees, choose extras'}
                    href={`/bowlers/${bowler.identifier}`}>
                Fees&nbsp;&amp;&nbsp;Extras
              </Link>
            </div>
          )}
        </div>
      );
    } else {
      if (firstAvailablePosition === 0) {
        firstAvailablePosition = currentPosition;
      }
      row = (
        <div className={'d-flex align-items-center py-2 tournio-striped-list-item'} key={`row${i}`}>
          <div className={'ps-2'}>
            {currentPosition}.
          </div>
          <div className={'ms-auto pe-2'}>
            <Link className={''}
                  href={{
                    pathname: '/tournaments/[identifier]/teams/[teamIdentifier]/add-bowler',
                    query: {
                      identifier: tournament.identifier,
                      teamIdentifier: team.identifier,
                      position: currentPosition,
                    }
                  }}
            >
              <span className={'bi bi-plus-lg'} aria-hidden={true}/>
              <span className={'visually-hidden'}>
                  Add a Bowler
                </span>
            </Link>
          </div>
        </div>
      );
    }
    rows[i] = row;
  }

  const showPreferredShift = tournamentType === 'igbo_multi_shift' || tournamentType === 'single_event' && tournament.shifts.length > 1;
  const showMultipleShifts = tournamentType === 'igbo_mix_and_match';

  let successSupplement = ' You may now select events, extras, and pay entry fees.';
  if (registeringWithoutPayments) {
    successSupplement = ' We look forward to seeing you.';
  }

  return (
    <>
      <div className={`row d-md-none`}>
        <div className={'col-5'}>
          <Link href={`/tournaments/${identifier}`}>
            <TournamentLogo url={tournament.imageUrl} additionalClasses={'mb-2'}/>
          </Link>
        </div>
        <p className={'col display-4'}>
          Team Details
        </p>
      </div>

      <div className={'row'}>
        <div className={'col-12 col-md-4'}>
          <div className={'d-none d-md-block'}>
            <Link href={`/tournaments/${identifier}`}>
              <TournamentLogo url={tournament.imageUrl}/>
            </Link>
          </div>
        </div>

        <div className={'col-12 col-md-8'}>
          <SuccessAlert className={``}
                        message={state.successMessage + successSupplement}
                        onClose={clearSuccessMessage}/>

          <h1 className={'d-none d-md-block display-5 ps-1 pt-2 py-3 bg-primary-subtle'}>
            Team Details
          </h1>

          <h3 className={'py-3'}>
            Name: <strong>{team.name}</strong>
          </h3>

          {showPreferredShift && (
            <h4 className={'pb-2'}>
              Shift Preference: {team.shifts[0].name}
            </h4>
          )}
          {showMultipleShifts && (
            <h4 className={'pb-2'}>
              Shift Preferences: {team.shifts.map(({name}) => name).join(', ')}
            </h4>
          )}

          <h5 className={'pb-2'}>
            Bowlers:
          </h5>
          <div className={'tournio-striped-list'}>
            {rows}
          </div>

          <hr />
          <UrlShare url={shareUrl} fullTeam={firstAvailablePosition === 0}/>
        </div>
      </div>
    </>
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
