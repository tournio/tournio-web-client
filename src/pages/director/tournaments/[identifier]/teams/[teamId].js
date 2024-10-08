import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Card, Button, Row, Col} from "react-bootstrap";

import DirectorLayout from "../../../../../components/Layout/DirectorLayout/DirectorLayout";
import Breadcrumbs from "../../../../../components/Director/Breadcrumbs/Breadcrumbs";
import TeamDetails from "../../../../../components/Director/TeamDetails/TeamDetails";
import {directorApiRequest, useModernTournament, useTeam} from "../../../../../director";
import LoadingMessage from "../../../../../components/ui/LoadingMessage/LoadingMessage";
import {useLoginContext} from "../../../../../store/LoginContext";
import SuccessAlert from "../../../../../components/common/SuccessAlert";
import ErrorAlert from "../../../../../components/common/ErrorAlert";
import {updateObject} from "../../../../../utils";
import UrlShare from "../../../../../components/ui/UrlShare/UrlShare";

const Page = () => {
  const router = useRouter();
  const {authToken} = useLoginContext();
  const {successCode} = router.query;

  const {loading: tournamentLoading, tournament, tournamentUpdatedQuietly} = useModernTournament();
  const {loading, team, error, teamUpdated} = useTeam();


  const [success, setSuccess] = useState({
    update: null,
  });
  const [errors, setErrors] = useState({
    delete: null,
    update: null,
  });
  const [operationInProgress, setOperationInProgress] = useState({
    delete: false,
    update: false,
  });

  const [teamData, setTeamData] = useState({
    fields: {},
    touched: false,
    valid: true,
    errors: [],
  });

  useEffect(() => {
    if (!successCode) {
      return;
    }
    let msg;
    switch (successCode) {
      case '2':
        msg = 'Bowler added';
        break;
      default:
        msg = 'Something went well!';
        break;
    }
    setSuccess({
      ...success,
      update: msg,
    });
  }, [successCode]);

  const onDeleteTeamSuccess = (_) => {
    setOperationInProgress({
      ...operationInProgress,
      delete: false,
    });
    const modifiedTournament = updateObject(tournament, {
      team_count: tournament.team_count - 1,
    });
    tournamentUpdatedQuietly(modifiedTournament);

    const urlObject = {
      pathname: `/director/tournaments/[identifier]/teams`,
      query: {
        identifier: tournament.identifier,
        success: `deleted`,
      }
    }
    router.push(urlObject);
  }

  const onDeleteTeamFailure = (error) => {
    setOperationInProgress({
      ...operationInProgress,
      delete: false,
    });
    setErrors({
      ...errors,
      delete: error.message,
    });
  }

  const deleteSubmitHandler = (event) => {
    event.preventDefault();
    if (confirm('This will remove the team and all its bowlers. Are you sure?')) {
      const uri = `/teams/${team.identifier}`;
      const requestConfig = {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
        },
      }
      setOperationInProgress({
        ...operationInProgress,
        delete: true,
      });
      directorApiRequest({
        uri: uri,
        requestConfig: requestConfig,
        authToken: authToken,
        onSuccess: onDeleteTeamSuccess,
        onFailure: onDeleteTeamFailure,
      });
    }
  }

  const updateTeamSuccess = (data) => {
    setOperationInProgress({
      ...operationInProgress,
      update: false,
    });
    setSuccess({
      ...success,
      update: 'Changes applied',
    });
    teamUpdated(data);
  }

  const updateTeamFailure = (data) => {
    setOperationInProgress({
      ...operationInProgress,
      update: false,
    });
    setErrors({
      ...errors,
      update: data.message,
    });
  }

  const formChangedHandler = (newTeamData) => {
    const updatedTeamData = {
      ...teamData,
      ...newTeamData,
    }
    setTeamData(updatedTeamData);
  }

  const updateSubmitHandler = () => {
    const uri = `/teams/${team.identifier}`;
    const requestConfig = {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        team: {
          ...teamData.fields,
        },
      },
    }
    setOperationInProgress({
      ...operationInProgress,
      update: true,
    });
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: updateTeamSuccess,
      onFailure: updateTeamFailure,
    });
  }

  ////////////////////////////////////////////////////////////////////

  if (tournamentLoading || loading || !team) {
    return <LoadingMessage message={'Retrieving team details...'}/>
  }

  if (error) {
    return <ErrorAlert message={error} className={`mt-3`}/>;
  }

  const ladder = [
    {text: 'Tournaments', path: '/director/tournaments'},
    {text: tournament.name, path: `/director/tournaments/${tournament.identifier}`},
    {text: 'Teams', path: `/director/tournaments/${tournament.identifier}/teams`},
  ];

  const port = process.env.NODE_ENV === 'development' ? `:${window.location.port}` : '';
  const shareUrl = `${window.location.protocol}//${window.location.hostname}${port}/teams/${team.identifier}`;

  return (
    <div>
      <Breadcrumbs ladder={ladder} activeText={team.name}/>
      <Row>
        <Col md={8}>
          <TeamDetails tournament={tournament}
                       team={team}
                       teamUpdated={formChangedHandler}
          />

          {teamData.errors.length > 0 && (
            <div className={`alert alert-danger fade show pb-1`}>
              <ul>
                {teamData.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className={'text-center mt-3'}>
            <button className={'btn btn-primary'}
                    disabled={!(teamData.touched && teamData.valid)}
                    onClick={updateSubmitHandler}>
              Save Team Details
            </button>
          </div>

          <SuccessAlert message={success.update}
                        className={'mt-3'}
                        onClose={() => setSuccess({
                          ...success,
                          update: null,
                        })}
          />

          <ErrorAlert message={errors.update}
                      className={`mt-3`}
                      onClose={() => setErrors({
                        ...errors,
                        update: null,
                      })}
          />


          <div className={'mt-4'}>
            <UrlShare url={shareUrl} admin={true}/>
          </div>
        </Col>

        <Col md={4}>
          <hr className={'d-sm-none'}/>
          <Card>
            <Card.Header as={'h5'}>
              Danger Zone
            </Card.Header>
            <Card.Body className={'text-center'}>
              <form onSubmit={deleteSubmitHandler}>
              <Button variant={'danger'}
                        type={'submit'}
                >
                  Delete Team
                </Button>
              </form>
            </Card.Body>
          </Card>

        </Col>
      </Row>
    </div>
  );
}

Page.getLayout = function getLayout(page) {
  return (
    <DirectorLayout>
      {page}
    </DirectorLayout>
  );
}

export default Page;
