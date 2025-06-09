import {useEffect, useState} from 'react';
import {Card} from "react-bootstrap";
import {Map} from 'immutable';

import {directorApiRequest, useTournament} from "../../../director";
import {useLoginContext} from "../../../store/LoginContext";
import ErrorAlert from "../../common/ErrorAlert";
import {updateObject} from "../../../utils";

const RegistrationOptions = () => {
  const {authToken} = useLoginContext();
  const {tournament, tournamentUpdatedQuietly} = useTournament();

  const REGISTRATION_TYPES = ['new_team', 'new_pair', 'solo'];
  const REGISTRATION_TYPE_LABELS = {
    new_team: 'New Teams',
    new_pair: 'New Doubles Pair',
    solo: 'Solo Entries',
  };

  const initialFormData = Map({
    new_team: false,
    solo: false,
    new_pair: false,
  });

  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState(null);

  // Populate form data with what the tournament already has, and disable
  // the ones that don't apply for the tournament type
  useEffect(() => {
    if (!tournament) {
      return;
    }
    const newFormData = formData.withMutations(map => {
      REGISTRATION_TYPES.forEach(rType => {
        map.set(rType, tournament.registration_options[rType]);
      });
    });
    setFormData(Map(newFormData));
  }, [tournament]);

  if (!tournament) {
    return '';
  }

  const tournType = tournament.config_items.find(({key}) => key === 'tournament_type').value;
  let allowedOptionSet = ['solo'];
  switch(tournType) {
    case 'single_event':
    case 'igbo_non_standard':
      tournament.events.forEach(event => {
        if (['team', 'trio'].includes(event.roster_type)) {
          allowedOptionSet.push('new_team');
        }

        if (event.roster_type === 'double') {
          allowedOptionSet.push('new_pair');
        }
      });
      break;
    default:
      allowedOptionSet.push('new_team');
      break;
  }

  const optionToggled = (event) => {
    const inputName = event.target.name;
    const newValue = event.target.checked;
    const newFormData = formData.set(inputName, newValue);
    setFormData(newFormData);
    submitRegistrationOptions(newFormData);
  }

  const submitRegistrationOptions = (options) => {
    const uri = `/tournaments/${tournament.identifier}`;
    const enabledTypes = [];
    REGISTRATION_TYPES.forEach(rType => {
      if (options.get(rType)) {
        enabledTypes.push(rType);
      }
    });
    const requestConfig = {
      method: 'patch',
      data: {
        tournament: {
          details: {
            enabled_registration_options: enabledTypes,
          },
        },
      },
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: (data) => submissionCompleted(data),
      onFailure: (data) => setErrorMessage(data.error),
    })
  }

  const submissionCompleted = (data) => {
    const updatedTournsment = updateObject(tournament, {
      registration_options: {...data.registration_options},
    });
    tournamentUpdatedQuietly(updatedTournsment);
  }

  return (
    <Card className={'mb-3'}>
      <Card.Header as={'h5'} className={'fw-light'}>
        Registration Options
      </Card.Header>
      <Card.Body>
        {allowedOptionSet.map(kind => {
          return (
            <div className={'form-check form-switch'} key={kind}>
              <input type={'checkbox'}
                     className={'form-check-input'}
                     role={'switch'}
                     id={kind}
                     name={kind}
                     checked={formData.get(kind)}
                     onChange={optionToggled}/>
              <label htmlFor={kind}
                     className={'form-check-label'}>
                {REGISTRATION_TYPE_LABELS[kind]}
              </label>
            </div>
          )
        })}

      </Card.Body>
      <ErrorAlert message={errorMessage}
                  className={`mx-3`}
                  onClose={() => setErrorMessage(null)}
                  />
    </Card>
  );
}

export default RegistrationOptions;
