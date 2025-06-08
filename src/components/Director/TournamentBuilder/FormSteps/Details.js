import {useEffect, useState} from "react";
import {useDirectorContext} from "../../../../store/DirectorContext";
import {devConsoleLog, timezones} from "../../../../utils";

import classes from '../TournamentBuilder.module.scss';
import {newTournamentSaved, newTournamentStepCompleted} from "../../../../store/actions/directorActions";
import {directorApiRequest} from "../../../../director";
import {useLoginContext} from "../../../../store/LoginContext";

const Details = () => {
  const {state, dispatch} = useDirectorContext();
  const {authToken} = useLoginContext();

  const REGISTRATION_WITHOUT_PAYMENTS = 'registration_without_payments';

  const STANDARD_EVENTS = [
    {
      name: 'Singles',
      roster_type: 'single',
      // game_count: 3,
    },
    {
      name: 'Doubles',
      roster_type: 'double',
      // game_count: 3,
    },
    {
      name: 'Team',
      roster_type: 'team',
      // game_count: 3,
    },
  ];

  const ROSTER_TYPES = [
    {
      name: 'Singles',
      roster_type: 'single',
    },
    {
      name: 'Doubles',
      roster_type: 'double',
    },
    {
      name: 'Trios',
      roster_type: 'trio',
    },
    {
      name: 'Team',
      roster_type: 'team',
    },
  ]

  const tournamentTypes = {
    'igbo_standard': {
      key: 'igbo_standard',
      display: 'IGBO Standard',
    },
    'igbo_multi_shift': {
      key: 'igbo_multi_shift',
      display: 'IGBO Multi-shift',
    },
    'igbo_mix_and_match': {
      key: 'igbo_mix_and_match',
      display: 'IGBO Mix and Match',
    },
    'igbo_non_standard': {
      key: 'igbo_non_standard',
      display: 'IGBO Non-standard',
    },
    'single_event': {
      key: 'single_event',
      display: 'Single Event',
    },
  }

  const initialState = {
    fields: {
      location: '',
      timezone: '',
      website: '',
      website_config_item_id: null,
      tournament_type: 'igbo_standard',
      tournament_type_config_item_id: null,
      registration_without_payments: false,
      registration_without_payments_item_id: null,
      events: [...STANDARD_EVENTS],
    },
    valid: false,
  }

  const [formData, setFormData] = useState(initialState);
  useEffect(() => {
    if (!state || !state.builder) {
      return;
    }
    if (state.builder.tournament) {
      // We might have returned to this page after advancing.
      const newFormData = {...formData};
      newFormData.fields.location = state.builder.tournament.location || '';
      newFormData.fields.timezone = state.builder.tournament.timezone || '';

      const websiteConfigItem = state.builder.tournament.config_items.find(({key}) => key === 'website');
      if (websiteConfigItem) {
        newFormData.fields.website = websiteConfigItem.value;
        newFormData.fields.website_config_item_id = websiteConfigItem.id;
      }

      const typeConfigItem = state.builder.tournament.config_items.find(({key}) => key === 'tournament_type');
      if (typeConfigItem) {
        newFormData.fields.tournament_type = typeConfigItem.value;
        newFormData.fields.tournament_type_config_item_id = typeConfigItem.id;
      }

      const regWithoutPayItem = state.builder.tournament.config_items.find(({key}) => key === REGISTRATION_WITHOUT_PAYMENTS);
      if (regWithoutPayItem) {
        newFormData.fields.registration_without_payments = regWithoutPayItem.value;
        newFormData.fields.registration_without_payments_item_id = regWithoutPayItem.id;
      }

      newFormData.fields.events = [...state.builder.tournament.events];

      newFormData.valid = isValid(newFormData.fields);
      setFormData(newFormData);
    }
  }, [state, state.builder])

  const isValid = (fields) => {
    return fields.location.length > 0 && fields.timezone.length > 0;
  }

  const inputChanged = (event) => {
    const changedData = {...formData};
    const fieldName = event.target.name;

    let newValue = event.target.value;
    if (fieldName === 'events') {
      const previousEvents = formData.fields.events;
      const whichEvent = newValue;
      changedData.fields.events = event.target.checked
        ? previousEvents.concat(ROSTER_TYPES.find(({roster_type}) => roster_type === whichEvent)) // add to the list
        : previousEvents.filter(({roster_type}) => roster_type !== whichEvent); // everything but the checked one
    } else if (fieldName === 'tournament_type') {
      changedData.fields.tournament_type = newValue;
      if (['igbo_non_standard', 'single_event'].includes(formData.fields.tournament_type)) {
        changedData.fields.events = [];
      } else {
        changedData.fields.events = [...STANDARD_EVENTS];
      }
    } else if (fieldName === 'registration_without_payments') {
      changedData.fields.registration_without_payments = event.target.checked;
    } else {
      changedData.fields[fieldName] = newValue;
    }

    changedData.valid = isValid(changedData.fields);
    setFormData(changedData);
  }

  if (!state.builder) {
    return '';
  }

  const saveSuccess = (data) => {
    // put the updated tournament into context, and set the next step
    dispatch(newTournamentSaved(data));
    dispatch(newTournamentStepCompleted('details', 'dates'));
  }

  const nextClicked = () => {
    const identifier = state.builder.tournament.identifier;
    const uri = `/tournaments/${identifier}`;
    const websiteItemAttributes = {
      key: 'website',
      value: formData.fields.website,
    }
    if (formData.fields.website_config_item_id) {
      websiteItemAttributes.id = formData.fields.website_config_item_id;
    }
    const typeItemAttributes = {
      key: 'tournament_type',
      value: formData.fields.tournament_type,
    }
    if (formData.fields.tournament_type_config_item_id) {
      typeItemAttributes.id = formData.fields.tournament_type_config_item_id;
    }

    const requestConfig = {
      method: 'patch',
      data: {
        tournament: {
          location: formData.fields.location,
          timezone: formData.fields.timezone,
          config_items_attributes: [
            websiteItemAttributes,
            typeItemAttributes,
          ],
          events_attributes: formData.fields.events,
        },
      },
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: saveSuccess,
      onFailure: (err) => devConsoleLog("Failed to update tournament.", err),
    });
  }

  const showEventsField = ['igbo_non_standard', 'single_event'].includes(formData.fields.tournament_type);

  return (
    <div>
      <h3>
        {state.builder.tournament.name}{' '}
        ({state.builder.tournament.abbreviation}){' '}
        {state.builder.tournament.year}
      </h3>

      <div className={`row ${classes.FieldRow}`}>
        <label htmlFor={'location'}
               className={'col-12 col-md-3 col-form-label'}>
          City, State
        </label>
        <div className={'col'}>
          <input type={'text'}
                 name={'location'}
                 id={'location'}
                 className={'form-control'}
                 value={formData.fields.location}
                 onChange={inputChanged}/>
        </div>
      </div>

      <div className={`row ${classes.FieldRow}`}>
        <label htmlFor={'timezone'}
               className={'col-12 col-md-3 col-form-label'}>
          Time Zone
        </label>
        <div className={'col'}>
          <select name={'timezone'}
                  className={'form-select'}
                  onChange={inputChanged}
                  value={formData.fields.timezone}>
            <option value={''}>--</option>
            {Object.values(timezones).map(({key, display}) => (
              <option value={key} key={key}>{display}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`row ${classes.FieldRow}`}>
        <label htmlFor={'website'}
               className={'col-12 col-md-3 col-form-label'}>
          Website URL
        </label>
        <div className={'col'}>
          <input type={'text'}
                 name={'website'}
                 id={'website'}
                 className={'form-control'}
                 value={formData.fields.website}
                 onChange={inputChanged}/>
        </div>
      </div>

      <div className={`row ${classes.FieldRow}`}>
        <div className={`col-12 col-md-9 offset-md-3`}>
          <div className={'form-check'}>
            <input className={'form-check-input'}
                   type='checkbox'
                   checked={formData.fields.registration_without_payments}
                   onChange={inputChanged}
                   name={'registration_without_payments'}
                   id={'registration_without_payments'}/>
            <label className={'form-check-label'}
                   htmlFor={'registration_without_payments'}>
              Registration Without Payments
            </label>
          </div>
        </div>
      </div>

      <div className={`row ${classes.FieldRow}`}>
        <label htmlFor={'tournament_type'}
               className={'col-12 col-md-3 col-form-label'}>
          Type
        </label>
        <div className={'col'}>
          <select name={'tournament_type'}
                  id={'tournament_type'}
                  className={'form-select'}
                  onChange={inputChanged}
                  value={formData.fields.tournament_type}>
            <option value={''}>--</option>
            {Object.values(tournamentTypes).map(({key, display}) => (
              <option value={key} key={key}>{display}</option>
            ))}
          </select>
        </div>
      </div>

      {showEventsField && (
        <div className={`row ${classes.FieldRow}`}>
          <label htmlFor={'events'}
                 className={'col-12 col-md-3 col-form-label'}>
            Event(s)
          </label>
          <div className={'col'}>
            {ROSTER_TYPES.map(({name, roster_type}) => {
              return (
                <div key={roster_type} className="form-check">
                  <input className="form-check-input"
                         type="checkbox"
                         value={roster_type}
                         checked={formData.fields.events.some(e => e.roster_type === roster_type)}
                         onChange={inputChanged}
                         name={`events`}
                         id={`event-${roster_type}`}/>
                  <label className="form-check-label"
                         htmlFor={`event-${roster_type}`}>
                    {name}
                  </label>
                </div>
              )
            })}
          </div>
        </div>

      )}

      <div className={`row ${classes.ButtonRow}`}>
        <div className={'col-12 d-flex justify-content-end'}>
          <button className={'btn btn-outline-primary'}
                  role={'button'}
                  onClick={nextClicked}>
            Next
            <i className={'bi-arrow-right ps-2'} aria-hidden={true}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Details;
