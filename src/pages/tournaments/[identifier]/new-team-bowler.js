import {useRouter} from "next/router";

import RegistrationLayout from "../../../components/Layout/RegistrationLayout/RegistrationLayout";
import {useRegistrationContext} from "../../../store/RegistrationContext";
import {newTeamBowlerInfoAdded, newTeamBowlerInfoUpdated} from "../../../store/actions/registrationActions";
import {useTheTournament} from "../../../utils";
import React, {useEffect, useState} from "react";
import LoadingMessage from "../../../components/ui/LoadingMessage/LoadingMessage";
import Link from "next/link";
import TournamentLogo from "../../../components/Registration/TournamentLogo/TournamentLogo";
import Sidebar from "../../../components/Registration/Sidebar/Sidebar";
import ProgressIndicator from "../../../components/Registration/ProgressIndicator/ProgressIndicator";
import ErrorAlert from "../../../components/common/ErrorAlert";
import DumbBowlerForm from "../../../components/Registration/DumbBowlerForm/DumbBowlerForm";

const Page = () => {
  const {registration, dispatch} = useRegistrationContext();
  const router = useRouter();
  const {identifier, edit, index} = router.query;

  const [takenPositions, setTakenPositions] = useState([]);

  const {loading, tournament} = useTheTournament(identifier);

  // If new-team registrations aren't enabled, go back to the tournament home page
  useEffect(() => {
    if (!identifier || !tournament || !registration) {
      return;
    }
    if (!tournament.registrationOptions.new_team) {
      router.push(`/tournaments/${identifier}`);
    }

    if (registration.team) {
      if (!edit) {
        // Have we reached team capacity? If so, let's move to the next step,
        // whichever that step may be.
        if (registration.team.bowlers.length === tournament.config.team_size) {
          if (tournament.events.some(({rosterType}) => rosterType === 'double')) {
            router.push(`/tournaments/${identifier}/doubles-partners`);
          } else {
            router.push(`/tournaments/${identifier}/new-team-review`);
          }
        } else {
          // otherwise, update our array of taken positions
          const newTakenPositions = registration.team.bowlers.map(({position}) => position);
          setTakenPositions(newTakenPositions);
        }
      }
    }
  }, [edit, tournament, registration]);

  if (loading || !tournament) {
    return (
      <div>
        <LoadingMessage message={'Looking for the tournament...'}/>
      </div>
    );
  }

  if (!registration.team) {
    // This happens when we're starting over, as part of a re-render that happens before the redirection.
    return '';
  }

  ////////////////////////////////

  const newBowlerAdded = (bowlerInfo) => {
    dispatch(newTeamBowlerInfoAdded(bowlerInfo));

    const newTakenPositions = takenPositions.concat(bowlerInfo.position).sort();
    setTakenPositions(newTakenPositions);

    // If that's the last one, then move along!
    if (newTakenPositions.length === tournament.config.team_size) {
      if (tournament.events.some(({rosterType}) => rosterType === 'double')) {
        router.push(`/tournaments/${identifier}/doubles-partners`);
      } else {
        router.push(`/tournaments/${identifier}/new-team-review`);
      }
    }

    // Otherwise, we're good as we are.
  }

  const bowlerUpdated = (bowlerInfo) => {
    dispatch(newTeamBowlerInfoUpdated(bowlerInfo, index));

    router.push(`/tournaments/${identifier}/new-team-review?successIndex=${index}`);
  }

  const finishedWithBowlersClicked = (e) => {
    e.preventDefault();

    // They've chosen not to fill the team up just yet, so let's move on
    if (tournament.events.some(({rosterType}) => rosterType === 'double')) {
      router.push(`/tournaments/${identifier}/doubles-partners`);
    } else {
      router.push(`/tournaments/${identifier}/new-team-review`);
    }
  }

  const titleText = edit ? 'Make Changes' : 'Add Bowler Details';
  const buttonText = edit ? 'Save Changes' : 'Save Bowler';

  // for the sidebar
  let preferredShiftNames = [];
  if (registration.team.shiftIdentifiers) {
    preferredShiftNames = registration.team.shiftIdentifiers.map(identifier =>
      tournament.shifts.find(shift => shift.identifier === identifier).name
    );
  }

  // for making changes
  let bowlerData, error;
  if (edit) {
    const parsed = parseInt(index);
    if (parsed >= 0 && parsed < registration.team.bowlers.length) {
      bowlerData = registration.team.bowlers[parsed];
    } else {
      error = 'Bowler data not found.';
    }
  }

  // for the form
  const fieldData = {};
  const fieldNames = [
    'firstName',
    'nickname',
    'lastName',
    'email',
    'phone',
  ].concat(tournament.config['bowler_form_fields'].split(' ')).concat(tournament.additionalQuestions.map(q => q.name));

  // Only display the position field for new bowler intake; editing with position
  // creates a race condition in the form component (setup vs. bowler data population)
  if (!edit) {
    fieldNames.unshift('position');

    fieldData.position = {
      elementConfig: {
        choices: [],
      }
    }
    for (let p = 1; p <= tournament.config['team_size']; p++) {
      fieldData.position.elementConfig.choices.push({
        value: p,
        label: p,
        disabled: takenPositions.includes(p),
      });
    }
  }

  const progressSteps = ['team', 'bowlers'];
  if (tournament.events.some(({rosterType}) => rosterType === 'double')) {
    progressSteps.push('doubles');
  }
  progressSteps.push('review');

  // Future improvement: merge the concepts of "bowler form fields" and "additional questions"

  return (
    <>
      <div className={'row d-flex d-md-none'}>
        <p className={'display-3'}>
          {tournament.abbreviation} {tournament.year}
        </p>
        <ProgressIndicator completed={['team']} steps={progressSteps} active={'bowlers'}/>
      </div>

      <div className={'row'}>
        <div className={'col-12 col-md-4'}>

          <div className={'d-none d-md-block'}>
            <Link href={`/tournaments/${identifier}`}>
              <TournamentLogo url={tournament.imageUrl}/>
            </Link>
          </div>

          <Sidebar tournament={tournament}
                   teamName={registration.team.name}
                   bowlers={registration.team.bowlers}
                   shiftPreferences={preferredShiftNames}/>

          {!edit && takenPositions.length > 0 && (
            <div className={'text-end'}>
              <p className={'my-3'}>
                Finished with bowlers?
              </p>
              <p>
                <Link href={{
                  pathname: '/tournaments/[identifier]/doubles-partners',
                  query: {
                    identifier: identifier,
                  }
                }}
                      className={'btn btn-outline-primary'}
                      onClick={finishedWithBowlersClicked}>
                  Next Step
                  <i className="bi bi-chevron-double-right ps-1" aria-hidden="true"/>
                </Link>
              </p>
            </div>
          )}
          {edit && (
            <div className={'text-start'}>
              <p className={'my-3'}>
                <Link href={{
                  pathname: '/tournaments/[identifier]/new-team-review',
                  query: {
                    identifier: identifier,
                  }
                }}
                      className={'btn btn-outline-primary'}>
                  <i className="bi bi-chevron-double-left pe-1" aria-hidden="true"/>
                  Cancel Changes
                </Link>
              </p>
            </div>
          )}

          <hr className={'d-md-none'}/>
        </div>

        <div className={'col-12 col-md-8'}>
          <div className={'d-none d-md-block'}>
            <ProgressIndicator completed={['team']} steps={progressSteps} active={'bowlers'}/>
          </div>
          <p className={'d-md-none display-5'}>
            {titleText}
          </p>
          <p className={'d-none d-md-block display-6'}>
            {titleText}
          </p>
          {error && (
            <ErrorAlert message={error}/>
          )}
          {!error && (
            // <BowlerForm tournament={tournament}
            //             takenPositions={takenPositions}
            //             bowlerInfoSaved={edit ? bowlerUpdated : newBowlerAdded}
            //             bowlerData={bowlerData} // Update this for the editing case
            //             nextButtonText={buttonText}/>
            <DumbBowlerForm tournament={tournament}
                            bowler={bowlerData}
                            onBowlerSave={edit ? bowlerUpdated : newBowlerAdded}
                            submitButtonText={buttonText}
                            fieldNames={fieldNames}
                            fieldData={fieldData}/>
          )}
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
