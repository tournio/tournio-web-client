import {useRouter} from "next/router";

import RegistrationLayout from "../../../components/Layout/RegistrationLayout/RegistrationLayout";
import {useRegistrationContext} from "../../../store/RegistrationContext";
import {
  devConsoleLog,
  submitNewTeamRegistration,
  useTheTournament
} from "../../../utils";
import React, {useEffect, useState} from "react";
import LoadingMessage from "../../../components/ui/LoadingMessage/LoadingMessage";
import NewTeamReview from "../../../components/Registration/NewTeamReview/NewTeamReview";
import Link from "next/link";
import {newTeamEntryCompleted} from "../../../store/actions/registrationActions";
import TournamentLogo from "../../../components/Registration/TournamentLogo/TournamentLogo";
import ProgressIndicator from "../../../components/Registration/ProgressIndicator/ProgressIndicator";
import BowlerSummary from "../../../components/Registration/ReviewEntries/BowlerSummary";
import ErrorAlert from "../../../components/common/ErrorAlert";

const Page = () => {
  const {registration, dispatch} = useRegistrationContext();
  const router = useRouter();
  const {identifier} = router.query;

  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const {loading: tournamentLoading, tournament} = useTheTournament(identifier);

  // If new-team registrations isn't enabled, go back to the tournament home page
  useEffect(() => {
    if (!identifier || !registration || !tournament) {
      return;
    }
    if (!tournament.registrationOptions.new_team) {
      router.push(`/tournaments/${identifier}`);
    }
  }, [identifier, registration]);

  if (tournamentLoading || !tournament) {
    return (
      <div>
        <LoadingMessage message={'Putting everything together...'}/>
      </div>
    );
  }

  const newTeamRegistrationSuccess = (teamData) => {
    dispatch(newTeamEntryCompleted(teamData));
    setProcessing(false);
    router.push({
      pathname: '/tournaments/[identifier]/teams/[teamIdentifier]',
      query: {
        identifier: identifier,
        teamIdentifier: teamData.identifier,
        success: 1,
      }
    });
  }

  const newTeamRegistrationFailure = (errorMsg) => {
    setProcessing(false);
    setError('Submission failed.');
    devConsoleLog("Submission failed. Details:", errorMsg);
  }

  const saveClicked = () => {
    // Write the team to the backend, with the single bowler.
    // Upon success, redirect to the team's page, which will
    // present its options.
    submitNewTeamRegistration({
      tournament: tournament,
      team: registration.team,
      onSuccess: newTeamRegistrationSuccess,
      onFailure: newTeamRegistrationFailure,
    });
    setProcessing(true);
  }

  if (!registration.team) {
    return '';
  }

  const completedSteps = ['team', 'bowlers'];
  if (tournament.events.some(({rosterType}) => rosterType === 'double')) {
    completedSteps.push('doubles');
  }

  const fieldNames = [
    'firstName',
    'lastName',
    'nickname',
    'email',
    'phone',
  ].concat(tournament.config['bowler_form_fields'].split(' ')).concat(tournament.additionalQuestions.map(q => q.name));

  const hasDoublesEvent = tournament.events.some(event => event.rosterType === 'double');
  const progressSteps = ['team', 'bowlers'];
  if (hasDoublesEvent) {
    progressSteps.push('doubles');
  }
  progressSteps.push('review');

  return (
    <>
      <div className={'row d-md-none'}>
        <div className={'col-5'}>
          <Link href={`/tournaments/${identifier}`}>
            <TournamentLogo url={tournament.imageUrl} additionalClasses={'mb-2'}/>
          </Link>
        </div>
        <p className={'col display-4'}>
          Let&apos;s Review...
        </p>
      </div>

      <div className={'row'}>
        <div className={'col-12 col-md-2'}>
          <div className={'d-none d-md-block'}>
            <Link href={`/tournaments/${identifier}`}>
              <TournamentLogo url={tournament.imageUrl}/>
            </Link>
          </div>
        </div>

        <div className={'col-12 col-md-10'}>
          <ProgressIndicator completed={completedSteps} steps={progressSteps} active={'review'}/>
          <p className={'d-none d-md-block display-5'}>
            Let&apos;s Review...
          </p>
          <div className={'alert alert-warning'}>
            Please check everything to make sure it&apos;s correct, and make any necessary changes. If everything looks
            good, hit the big{' '}
            <span className={'fw-bolder'}>
              Submit Registration
            </span>
            {' '}button at the bottom.
          </div>

          {/* team details */}
          <NewTeamReview tournament={tournament} team={registration.team}/>

          {/* bowler details */}
          {registration.team.bowlers.map((bowler, i) => {
            const index = bowler.doublesPartnerIndex;
            const partner = index >= 0 ? registration.team.bowlers[index] : null;
            return (
              <div key={`summary_${i}`} className={'mb-4'}>
                <div className={'d-flex align-items-baseline'}>
                  <h5>
                    Bowler {bowler.position}
                  </h5>
                  <Link href={
                    {
                      pathname: '/tournaments/[identifier]/new-team-bowler',
                      query: {
                        identifier: identifier,
                        edit: true,
                        index: i,
                      },
                    }}
                        className={'d-block ps-3'}>
                    (edit)
                  </Link>
                </div>
                <BowlerSummary tournament={tournament}
                               fieldNames={fieldNames}
                               bowler={bowler}
                               partner={partner}/>
              </div>
            )
          })}

          <div className={'row'}>

            {hasDoublesEvent && (
              <div className={'col-12 col-md-6 mb-3'}>
                <Link href={`/tournaments/${tournament.identifier}/doubles-partners?edit=true`}
                      className={'btn btn-secondary'}>
                  <i className="bi bi-chevron-double-left pe-1" aria-hidden="true"/>
                  Change doubles partners
                </Link>
              </div>
            )}

            <div className={`col-12 text-end ${hasDoublesEvent ? 'col-md-6' : ''}`}>
              <button className={'btn btn-lg btn-primary'}
                      onClick={saveClicked}
                      disabled={processing}>
                Submit Registration
                {!processing && (
                  <i className="bi bi-chevron-double-right ps-1" aria-hidden="true"/>
                )}
                {processing && (
                  <span className={`spinner-border spinner-border-sm ms-2`}
                        aria-hidden={true}
                        role={'status'}>
                  </span>
                )}
              </button>
            </div>

            {error && <ErrorAlert message={error}/>}
          </div>
        </div>
      </div>
    </>
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
