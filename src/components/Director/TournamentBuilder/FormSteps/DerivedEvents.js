import {useState} from "react";
import {useDirectorContext} from "../../../../store/DirectorContext";

import classes from '../TournamentBuilder.module.scss';

const DerivedEvents = () => {
  const {directorState, dispatch} = useDirectorContext();

  const DEFAULT_EVENT_DETAILS = {
    roster_type: '',
    name: '',
    scratch: false,
    use_scratch_divisions: false,
    entry_fee: 0,
    entry_fees_per_division: [],
    permit_multiple_entries: false,
  };

  const initialState = {
    fields: {
      events: [
        {...DEFAULT_EVENT_DETAILS},
      ],
    },
    valid: false,
  }

  const rosterTypeOptions = {
    single: 'Singles',
    double: 'Doubles',
    trio: 'Trios',
    team: 'Team',
  }
  const rosterTypes = Object.keys(rosterTypeOptions);

  const [formData, setFormData] = useState(initialState);

  const isValid = (fields) => {
    return fields.events.every(({roster_type, name, entry_fee}) => !!rosterTypeOptions[roster_type] && name.length > 0 && entry_fee >= 0)
  }

  const inputChanged = (event) => {
    // name is events.i.FIELDNAME
    const parts = event.target.name.split('.');
    const index = parseInt(parts[1]);
    let fieldName = parts[2];

    const changedData = {...formData};
    let newValue = event.target.value;

    // devConsoleLog("Checkbox event", event.target);
    if (event.target.type === 'radio') {
      newValue = newValue === 'true';
    } else if (event.target.type === 'checkbox') {
      newValue = event.target.checked;
    }

    changedData.fields.events[index][fieldName] = newValue;
    changedData.valid = isValid(changedData.fields);
    setFormData(changedData);
  }

  const addEventClicked = () => {
    const data = {...formData};
    data.fields.events = formData.fields.events.concat(
      {...DEFAULT_EVENT_DETAILS},
    );
    setFormData(data);
  }

  const removeEventClicked = () => {
    const data = {...formData};
    data.fields.events = formData.fields.events.slice(0, -1);
    setFormData(data);
  }

  return (
    <div>
      <h2>New Tournament: Derived Events</h2>
      <p>
        Optional events where the scores come from the bowled events, such as Mystery Doubles and Best 3 Across 9.
      </p>

      <fieldset>
        {formData.fields.events.map(({roster_type, name}, i) => (
          <div key={i} className={classes.Event}>
            <div className={`row ${classes.FieldRow}`}>
              <label htmlFor={`events_${i}_name`}
                     className={'col-12 col-md-3 col-form-label'}>
                Event Name
              </label>
              <div className={'col'}>
                <input type={'text'}
                       name={`events.${i}.name`}
                       id={`events_${i}_name`}
                       className={'form-control'}
                       value={formData.fields.events[i].name}
                       onChange={inputChanged}/>
              </div>
            </div>

            <div className={`row ${classes.FieldRow}`}>
              <label htmlFor={`events_${i}_roster_type`}
                     className={'col-12 col-md-3 col-form-label'}>
                Roster Type
              </label>
              <div className={'col col-md-4'}>
                <select name={`events.${i}.roster_type`}
                        id={`events_${i}_roster_type`}
                        className={'form-select'}
                        value={formData.fields.events[i].roster_type}
                        onChange={inputChanged}>
                  <option value={''}>-- select one --</option>
                  {rosterTypes.map(value => <option key={value} value={value}>{rosterTypeOptions[value]}</option>)}
                </select>
              </div>
            </div>

            <div className={`row ${classes.FieldRow}`}>
              <div className={'col-12 col-md-9 offset-md-3'}>
                <div className={'form-check'}>
                  <input type={'checkbox'}
                         id={`events_${i}_permit_multiple_entries`}
                         name={`events.${i}.permit_multiple_entries`}
                         className={'form-check-input'}
                         onChange={inputChanged}/>
                  <label className={'form-check-label'}
                         htmlFor={`events_${i}_permit_multiple_entries`}>
                    Bowlers may enter this event multiple times
                  </label>
                </div>
              </div>
            </div>

            <div className={`row ${classes.FieldRow}`}>
              <label className={'col-12 col-md-3 col-form-label'}>
                Scoring
              </label>
              <div className={'col'}>
                <div className={'form-check'}>
                  <input className={'form-check-input'}
                         type={'radio'}
                         name={`events.${i}.scratch`}
                         id={`events_${i}_scratch`}
                         value={'true'}
                         onChange={inputChanged}/>
                  <label className={'form-check-label'}
                         htmlFor={`events_${i}_scratch`}>
                    Scratch
                  </label>
                </div>

                <div className={'form-check'}>
                  <input className={'form-check-input'}
                         type={'radio'}
                         name={`events.${i}.scratch`}
                         id={`events_${i}_handicap`}
                         value={'false'}
                         onChange={inputChanged}/>
                  <label className={'form-check-label'}
                         htmlFor={`events_${i}_handicap`}>
                    Handicap
                  </label>
                </div>
              </div>
            </div>

            {formData.fields.events[i].scratch && (
              <div className={`row ${classes.FieldRow}`}>
                <div className={'col-12 col-md-9 offset-md-3'}>
                  <div className={'form-check'}>
                    <input type={'checkbox'}
                           id={`events_${i}_use_scratch_divisions`}
                           name={`events.${i}.use_scratch_divisions`}
                           className={'form-check-input'}
                           onChange={inputChanged}/>
                    <label className={'form-check-label'}
                           htmlFor={`events_${i}_use_scratch_divisions`}>
                      Use scratch divisions
                    </label>
                  </div>
                </div>
              </div>
            )}

            {!formData.fields.events[i].use_scratch_divisions && (
              <div className={`row ${classes.FieldRow}`}>
                <label className={'col-12 col-md-3 col-form-label'}>
                  Entry Fee
                </label>
                <div className={'col col-md-3'}>
                  <div className={'input-group'}>
                    <span className={'input-group-text'}>
                      <i className={'bi-currency-dollar'} aria-hidden={true}/>
                    </span>
                    <input type={'number'}
                           name={`events.${i}.entry_fee`}
                           id={`events_${i}_entry_fee`}
                           className={'form-control'}
                           value={formData.fields.events[i].entry_fee}
                           onChange={inputChanged}/>
                  </div>
                </div>
              </div>
            )}

            {formData.fields.events[i].use_scratch_divisions && (
              <div className={`row ${classes.FieldRow}`}>
                <label className={'col-12 col-md-3 col-form-label'}>
                  Entry Fees per Division
                </label>
                <div className={'col'}>
                  <div className={'form-control-plaintext'}>
                    TBD after divisions are saved and retrievable
                  </div>
                  {/*<div className={'input-group'}>*/}
                  {/*  <span className={'input-group-text'}>*/}
                  {/*    <i className={'bi-currency-dollar'} aria-hidden={true}/>*/}
                  {/*  </span>*/}
                  {/*  <input type={'number'}*/}
                  {/*         name={`events.${i}.entry_fee`}*/}
                  {/*         id={`events_${i}_entry_fee`}*/}
                  {/*         className={'form-control'}*/}
                  {/*         value={formData.fields.events[i].entry_fee}*/}
                  {/*         onChange={inputChanged}/>*/}
                  {/*</div>*/}
                </div>
              </div>

            )}

            {i === formData.fields.events.length - 1 && (
              <div className={`row ${classes.FieldRow}`}>
                <div className={'col d-flex justify-content-end'}>
                  <button type={'button'}
                          className={'btn btn-sm btn-outline-danger'}
                          onClick={removeEventClicked}>
                    <i className={'bi-dash-lg pe-2'} aria-hidden={true}/>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {formData.fields.events.length < Object.keys(rosterTypeOptions).length && (
          <div className={`row ${classes.FieldRow}`}>
            <div className={'col text-center'}>
              <button type={'button'}
                      className={'btn btn-sm btn-outline-secondary'}
                      name={'addEvent'}
                      onClick={addEventClicked}>
                <i className={'bi-plus-lg pe-2'} aria-hidden={true}/>
                Add Event
              </button>
            </div>
          </div>
        )}
      </fieldset>

      <div className={`row ${classes.ButtonRow}`}>
        <div className={'col-12 d-flex justify-content-between'}>
          <button className={'btn btn-outline-secondary'}
                  role={'button'}
                  onClick={() => {
                  }}>
            <i className={'bi-arrow-left pe-2'} aria-hidden={true}/>
            Previous
          </button>
          <button className={'btn btn-outline-primary'}
                  role={'button'}
                  onClick={() => {
                  }}>
            Next
            <i className={'bi-arrow-right ps-2'} aria-hidden={true}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DerivedEvents;
