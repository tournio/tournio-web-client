import {useEffect, useState} from "react";
import Card from 'react-bootstrap/Card';
import ListGroup from "react-bootstrap/ListGroup";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Link from 'next/link';

import {directorApiRequest, directorApiDownloadRequest, useTournament} from "../../../director";

import classes from './TournamentInPrep.module.scss';
import statusClasses from '../TournamentListing/TournamentListing.module.scss';
import {useLoginContext} from "../../../store/LoginContext";
import SuccessAlert from "../../common/SuccessAlert";
import ErrorAlert from "../../common/ErrorAlert";
import {updateObject} from "../../../utils";

const StatusAndCounts = () => {
  const {authToken} = useLoginContext();

  const testEnvFormInitialData = {
    registration_period: 'regular',
  }

  const [downloadMessage, setDownloadMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState();
  const [clearTestDataSuccessMessage, setClearTestDataSuccessMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [testEnvFormData, setTestEnvFormData] = useState(testEnvFormInitialData);
  const [testEnvSuccessMessage, setTestEnvSuccessMessage] = useState(null);

  const {loading: tournamentLoading, tournament, tournamentUpdatedQuietly} = useTournament();

  // Update the state of testEnvFormData
  useEffect(() => {
    if (!tournament) {
      return;
    }

    if (tournament.state !== 'setup') {
      const formData = {...testEnvFormData};

      Object.keys(tournament.available_conditions).forEach(name => {
        formData[name] = tournament.testing_environment.settings[name].value;
      });

      setTestEnvFormData(formData);
    }
  }, [tournament]);

  const downloadSuccess = (data, name) => {
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadMessage('Download completed.');
  }
  const downloadFailure = (data) => {
    setErrorMessage(`Download failed. ${data.error}`);
  }
  const downloadClicked = (event, uri, saveAsName) => {
    event.preventDefault();
    if (tournament.state === 'setup') {
      alert('You will be able to download this file once setup is complete');
      return;
    }
    directorApiDownloadRequest({
      uri: uri,
      authToken: authToken,
      onSuccess: (data) => downloadSuccess(data, saveAsName),
      onFailure: (data) => downloadFailure(data),
    });
  }

  const onClearTestDataSuccess = (_) => {
    setLoading(false);
    setClearTestDataSuccessMessage('Test data cleared!');
    tournamentUpdatedQuietly(tournament);
  }

  const onClearTestDataFailure = (data) => {
    console.log('Oopsie!', data);
    setLoading(false);
  }

  const clearTestDataClickHandler = () => {
    const uri = `/tournaments/${tournament.identifier}/clear_test_data`;
    const requestConfig = {
      data: {},
      method: 'post',
    }
    setLoading(true);
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: onClearTestDataSuccess,
      onFailure: onClearTestDataFailure,
    });
  }

  const testSettingOptionClicked = (event) => {
    const settingName = event.target.name;
    const newValue = event.target.value;
    const newForm = {...testEnvFormData};
    newForm[settingName] = newValue;
    setTestEnvFormData(newForm);
  }

  const testEnvSaveSuccess = (data) => {
    setTestEnvSuccessMessage('Testing environment updated.');
    const modifiedTournament = updateObject(tournament, {
      testing_environment: {...data }
    });
    tournamentUpdatedQuietly(modifiedTournament);
  }

  const testEnvSaved = (event) => {
    event.preventDefault();
    const uri = `/tournaments/${tournament.identifier}/testing_environment`;
    const requestConfig = {
      method: 'patch',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        testing_environment: {
          conditions: testEnvFormData,
        },
      },
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: testEnvSaveSuccess,
      onFailure: (data) => console.log('Oops.', data),
    });
  }

  if (tournamentLoading || !tournament) {
    return '';
  }

  const relevantItem = tournament.config_items.find(({key}) => key === 'registration_without_payments');
  const registeringWithoutPayments = relevantItem && relevantItem.value;

  ////////////////////////////

  const downloads = (
    <Card.Body>
      <Card.Subtitle className={'mb-3'}>
        Downloads
      </Card.Subtitle>
      <Card.Link className={'btn btn-sm btn-outline-primary'}
                 href={'#'}
                 onClick={(event) => downloadClicked(event, `/tournaments/${tournament.identifier}/csv_download`, 'bowlers.csv')}
      >
        CSV
      </Card.Link>
      {!registeringWithoutPayments && (
        <Card.Link className={'btn btn-sm btn-outline-primary'}
                   href={'#'}
                   onClick={(event) => downloadClicked(event, `/tournaments/${tournament.identifier}/financial_csv_download`, 'bowlers_financial.csv')}
        >
          Financial CSV
        </Card.Link>
      )}
      <Card.Link className={'btn btn-sm btn-outline-primary'}
                 href={'#'}
                 onClick={(event) => downloadClicked(event, `/tournaments/${tournament.identifier}/igbots_download`, 'bowlers.xml')}
      >
        IGBO-TS
      </Card.Link>
      <SuccessAlert message={downloadMessage}
                    className={`mt-3 mb-0`}
                    onClose={() => setDownloadMessage(null)}
                    />
      <ErrorAlert message={errorMessage}
                    className={`mt-3 mb-0`}
                    onClose={() => setErrorMessage(null)}
      />
    </Card.Body>
  );

  const counts = (
    <ListGroup variant={'flush'}>
      <ListGroup.Item className={'d-flex justify-content-between align-items-center'}
                      action
                      as={Link}
                      href={`/director/tournaments/${tournament.identifier}/bowlers`}
      >
        Bowlers
        <Badge pill={true} className={classes.CountBadge}>
          {tournament.bowler_count}
        </Badge>
      </ListGroup.Item>
      <ListGroup.Item className={'d-flex justify-content-between align-items-center'}
                      action
                      as={Link}
                      href={`/director/tournaments/${tournament.identifier}/teams`}>
        Teams
        <Badge pill={true} >
          {tournament.team_count}
        </Badge>
      </ListGroup.Item>
      {!registeringWithoutPayments && (
        <ListGroup.Item className={'d-flex justify-content-between align-items-center'}
                        action
                        as={Link}
                        href={`/director/tournaments/${tournament.identifier}/free_entries`}>
          Free Entries
          <Badge pill={true} >
            {tournament.free_entry_count}
          </Badge>
        </ListGroup.Item>
      )}
    </ListGroup>
  );

  let clearTestData = '';
  let testingStatusContent = '';
  if (tournament.state === 'testing' || tournament.state === 'demo') {
    clearTestData = (
      <Card.Body>
        <Card.Text>
          {!loading && (
            <Button variant={'warning'} onClick={clearTestDataClickHandler}>
              Clear Registration Data
            </Button>
          )}
          {loading && (
            <Button variant={'secondary'} disabled>
              Clearing...
            </Button>
          )}
        </Card.Text>
        <SuccessAlert message={clearTestDataSuccessMessage}
                      className={`mt-3 mb-0`}
                      onClose={() => setClearTestDataSuccessMessage(null)}
                      />
      </Card.Body>
    )
    testingStatusContent = (
      <Card.Body className={'border-bottom border-top'}>
        <Card.Title as={'h6'} className={'fw-light mb-3'}>
          Environment Setup
        </Card.Title>

        <form onSubmit={testEnvSaved}>
          {Object.values(tournament.testing_environment.settings).map(setting => (
            <div className={'row text-start d-flex align-items-center py-3'} key={setting.name}>
              <label className={'col-6 text-end fst-italic'}>
                {setting.display_name}
              </label>
              <div className={'col'}>
                {tournament.available_conditions[setting.name].options.map(option => (
                  <div className={'form-check'} key={option.value}>
                    <input type={'radio'}
                           name={setting.name}
                           id={`${setting.name}-${setting.value}`}
                           className={'form-check-input'}
                           value={option.value}
                           checked={testEnvFormData[setting.name] === option.value}
                           onChange={(event) => testSettingOptionClicked(event)}
                    />
                    <label className={'form-check-label'}
                           htmlFor={`${setting.name}-${setting.value}`}>
                      {option.display_value}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className={'row mt-3'}>
            <div className={'col-12'}>
              <button type={'submit'} className={'btn btn-primary'}>
                Save
              </button>
              <SuccessAlert message={testEnvSuccessMessage}
                            className={`mt-3 mb-0`}
                            onClose={() => setTestEnvSuccessMessage(null)}
              />

            </div>
          </div>
        </form>
      </Card.Body>
    );
  }

  const frontPageLink = (
    <Card.Body>
      <a href={`/tournaments/${tournament.identifier}`} target={'_new'}>
        Front Page
        <i className={classes.ExternalLink + " bi-box-arrow-up-right"} aria-hidden="true"/>
      </a>
    </Card.Body>
  );

  return (
    <Card className={[classes.Card, 'text-center', statusClasses.TournamentState].join(' ')}>
      <Card.Header as={'h5'} className={statusClasses[tournament.state]}>
        {tournament.status}
      </Card.Header>
      {tournament.state !== 'setup' && counts}
      {frontPageLink}
      {tournament.state !== 'setup' && downloads}
      {testingStatusContent}
      {clearTestData}
    </Card>
  );
}

export default StatusAndCounts;
