import {useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {Col, Row} from "react-bootstrap";

import {apiHost} from "../../utils";
import {useRegistrationContext} from "../../store/RegistrationContext";
import RegistrationLayout from "../../components/Layout/RegistrationLayout/RegistrationLayout";
import {teamDetailsRetrieved} from "../../store/actions/registrationActions";
import TournamentLogo from "../../components/Registration/TournamentLogo/TournamentLogo";
import Contacts from "../../components/Registration/Contacts/Contacts";
import TeamDetails from "../../components/Registration/TeamDetails/TeamDetails";

const page = () => {
  const router = useRouter();
  const { entry, dispatch, commerceDispatch } = useRegistrationContext();
  const { identifier, success } = router.query;

  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);

  // fetch the team details
  useEffect(() => {
    if (identifier === undefined) {
      return;
    }

    if (entry.team && entry.team.identifier === identifier) {
      setTeam(entry.team);
    } else {
      const requestConfig = {
        method: 'get',
        url: `${apiHost}/teams/${identifier}`,
        headers: {
          'Accept': 'application/json',
        }
      }
      axios(requestConfig)
        .then(response => {
          dispatch(teamDetailsRetrieved(response.data));
          commerceDispatch(teamDetailsRetrieved(response.data));
          setLoading(false);
        })
        .catch(error => {
          setLoading(false);
          // Display some kind of error message
        });
    }

  }, [identifier, entry]);

  if (loading) {
    return (
      <div>
        <p>
          Retrieving team details...
        </p>
      </div>
    );
  }

  if (!team) {
    return '';
  }

  if (!entry) {
    return '';
  }

  let joinLink = '';
  if (team.size < entry.tournament.max_bowlers && !success) {
    joinLink = (
      <p className={'text-center mt-2'}>
        <a href={`/teams/${team.identifier}/join`}
           className={'btn btn-outline-info'}>
          Join this Team
        </a>
      </p>
    );
  }

  return (
    <div>
      <Row>
        <Col xs={12} className={'d-md-none'}>
          <a href={`/tournaments/${entry.tournament.identifier}`} title={'To tournament page'}>
            <h4 className={'text-center'}>
              {entry.tournament.name}
            </h4>
          </a>
        </Col>
        <Col md={4} className={'d-none d-md-block'}>
          <a href={`/tournaments/${entry.tournament.identifier}`} title={'To tournament page'}>
            <TournamentLogo />
            <h4 className={'text-center'}>
              {entry.tournament.name}
            </h4>
          </a>
          <Contacts />
        </Col>
        <Col>
          <TeamDetails successType={success}/>
          {joinLink}
        </Col>
      </Row>
    </div>
  );
}

page.getLayout = function getLayout(page) {
  return (
    <RegistrationLayout>
      {page}
    </RegistrationLayout>
  );
}

export default page;