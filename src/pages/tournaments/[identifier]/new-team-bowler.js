import {useRouter} from "next/router";

import RegistrationLayout from "../../../components/Layout/RegistrationLayout/RegistrationLayout";
import BowlerForm from "../../../components/Registration/BowlerForm/BowlerForm";
import {useRegistrationContext} from "../../../store/RegistrationContext";
import {newTeamBowlerInfoAdded} from "../../../store/actions/registrationActions";
import {devConsoleLog, useTheTournament} from "../../../utils";
import {useEffect, useState} from "react";
import LoadingMessage from "../../../components/ui/LoadingMessage/LoadingMessage";
import Link from "next/link";
import TournamentLogo from "../../../components/Registration/TournamentLogo/TournamentLogo";
import Sidebar from "../../../components/Registration/Sidebar/Sidebar";
import ProgressIndicator from "../../../components/Registration/ProgressIndicator/ProgressIndicator";

const Page = () => {
  const {registration, dispatch} = useRegistrationContext();
  const router = useRouter();
  const {identifier, edit} = router.query;

  const [chosenPosition, choosePosition] = useState(1);

  const {loading, tournament} = useTheTournament(identifier);

  // If new-team registrations aren't enabled, go back to the tournament home page
  useEffect(() => {
    if (!identifier || !tournament || !registration) {
      return;
    }
    if (!tournament.registrationOptions.new_team) {
      router.push(`/tournaments/${identifier}`);
    }
    if (edit) {
      devConsoleLog("Edit is true.");
      choosePosition(registration.bowler.position);
    }
  }, [edit, tournament, registration]);

  if (loading || !tournament) {
    return (
      <div>
        <LoadingMessage message={'Looking for the tournament...'}/>
      </div>
    );
  }

  const newBowlerAdded = (bowlerInfo) => {
    devConsoleLog("Want to save. Then what?");
    // dispatch(newTeamBowlerInfoAdded(bowlerData));
    //
    // router.push(`/tournaments/${identifier}/new-team-review`);
  }

  // const positionChosen = (position) => {
  //   choosePosition(position);
  // }
  //
  // const previousBowlerData = edit ? registration.bowler : null;

  const titleText = edit ? 'Make Changes' : 'Add Bowler Details';
  const buttonText = edit ? 'Save Changes' : 'Next';

  return (
    // <div className={'row'}>
    //   <div className={'col-12'}>
    //     <TournamentHeader tournament={tournament}/>
    //
    //     <h2 className={`bg-primary-subtle py-3`}>
    //       First Bowler
    //     </h2>
    //
    //     <h4 className={``}>
    //       Team:&nbsp;
    //       <strong>
    //         {registration.team.name}
    //       </strong>
    //     </h4>
    //
    //   </div>
    //
    //   <div className={'col-md-10 offset-md-1 col-lg-8 offset-lg-2'}>
    //     <PositionChooser maxPosition={tournament.teamSize}
    //                      chosen={chosenPosition}
    //                      onChoose={positionChosen}/>
    //
    //     <BowlerForm tournament={tournament}
    //                 bowlerData={previousBowlerData}
    //                 bowlerInfoSaved={newBowlerAdded}/>
    //
    //   </div>
    // </div>


    <>
      <div className={'row d-md-none'}>
        <div className={'col-5'}>
          <TournamentLogo url={tournament.imageUrl} additionalClasses={'mb-2'}/>
        </div>
        <p className={'col display-4'}>
          {titleText}
        </p>
      </div>

      <div className={'row'}>
        <div className={'col-12 col-md-4'}>

          <div className={'d-none d-md-block'}>
            <Link href={`/tournaments/${identifier}`}>
              <TournamentLogo url={tournament.imageUrl}/>
            </Link>
            <p className={'col display-5'}>
              {titleText}
            </p>
          </div>

          <Sidebar tournament={tournament}
                   teamName={registration.team.name}
                   isTeam={true}/>
        </div>

        <div className={'col-12 col-md-8'}>
          <ProgressIndicator completed={['team']} active={'bowlers'}/>
          <BowlerForm tournament={tournament}
                      showShifts={false}
                      bowlerInfoSaved={newBowlerAdded}
                      bowlerData={null} // Update this for the editing case
                      nextButtonText={buttonText}/>
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
