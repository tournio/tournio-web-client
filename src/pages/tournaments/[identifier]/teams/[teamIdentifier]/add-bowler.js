import {useRegistrationContext} from "../../../../../store/RegistrationContext";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {useTeam, useTournament} from "../../../../../utils";
import LoadingMessage from "../../../../../components/ui/LoadingMessage/LoadingMessage";
import RegistrationLayout from "../../../../../components/Layout/RegistrationLayout/RegistrationLayout";
import TournamentHeader from "../../../../../components/ui/TournamentHeader";
import PositionChooser from "../../../../../components/common/formElements/PositionChooser/PositionChooser";
import BowlerForm from "../../../../../components/Registration/BowlerForm/BowlerForm";
import ErrorAlert from "../../../../../components/common/ErrorAlert";
import {existingTeamBowlerInfoAdded} from "../../../../../store/actions/registrationActions";
import Link from "next/link";

const Page = () => {
  const {registration, dispatch} = useRegistrationContext();
  const router = useRouter();
  const {identifier, teamIdentifier, position = 1, edit} = router.query;

  const [chosenPosition, choosePosition] = useState();
  useEffect(() => {
    if (!registration || !teamIdentifier) {
      return;
    }
    if (registration.bowler && registration.bowler.position) {
      choosePosition(registration.bowler.position);
    } else {
      choosePosition(parseInt(position));
    }
  }, [registration, teamIdentifier, position]);

  const {loading, team, error: fetchError } = useTeam(teamIdentifier);
  const {loading: tournamentLoading, tournament, error: tournamentError} = useTournament(identifier);

  if (!registration || !tournament) {
    return '';
  }

  if (loading) {
    return <LoadingMessage message={'Getting things ready...'}/>
  }

  if (fetchError) {
    return (
      <div>
        <ErrorAlert message={'Failed to load team.'}/>
      </div>
    );
  }

  if (tournamentError) {
    return (
      <div>
        <ErrorAlert message={'Failed to load tournament.'}/>
      </div>
    );
  }

  //////////////////////

  const unavailablePositions = team.bowlers.map(({position}) => position);

  const bowlerInfoSaved = (bowlerData) => {
    const completeBowlerData = {...bowlerData};
    if (!bowlerData.position) {
      completeBowlerData.position = chosenPosition;
    }
    dispatch(existingTeamBowlerInfoAdded(completeBowlerData));
    router.push({
      pathname: '/tournaments/[identifier]/teams/[teamIdentifier]/review-bowler',
      query: {
        identifier: identifier,
        teamIdentifier: teamIdentifier,
      }
    });
  }

  const previousBowlerData = edit && registration.bowler ? registration.bowler : null;

  const availableDoublesPartners = team.bowlers.filter(partner => (
    partner.doubles_partner_name === 'n/a'
  ));

  return (
    <div className={'col-md-10 offset-md-1 col-lg-8 offset-lg-2'}>
      <TournamentHeader tournament={tournament}/>

      <h2 className={''}>
        Team:&nbsp;
        <strong>
          <Link href={{
            pathname: '/tournaments/[identifier]/teams/[teamIdentifier]',
            query: {
              identifier: identifier,
              teamIdentifier: team.identifier,
            }
          }}>
            {team.name}
          </Link>
        </strong>
      </h2>

      <h3 className={``}>
        Add a Bowler
      </h3>

      <hr/>

      <PositionChooser maxPosition={tournament.team_size}
                       chosen={chosenPosition}
                       onChoose={choosePosition}
                       disallowedPositions={unavailablePositions}
      />

      <BowlerForm tournament={tournament}
                  bowlerData={previousBowlerData}
                  availablePartners={availableDoublesPartners}
                  bowlerInfoSaved={bowlerInfoSaved}/>

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
