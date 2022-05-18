import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {Map} from "immutable";
import Card from 'react-bootstrap/Card';

import {useDirectorContext} from "../../../store/DirectorContext";

import classes from './ShiftForm.module.scss';
import {directorApiRequest} from "../../../utils";

const ShiftForm = ({shift}) => {
  const context = useDirectorContext();
  const router = useRouter();

  const initialFormData = Map({
    // name: '',
    capacity: 0,
    // display_order: 1,
    // events: [],
    permit_new_teams: true,
    permit_joins: true,
    permit_solo: true,

    valid: false,
  });

  const [formData, setFormData] = useState(initialFormData);
  const [formDisplayed, setFormDisplayed] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!shift) {
      return;
    }
    const existingShift = {
      // name: shift.name,
      capacity: shift.capacity,
      // display_order: shift.display_order,
      // events: shift.events,
      permit_new_teams: shift.permit_new_teams,
      permit_joins: shift.permit_joins,
      permit_solo: shift.permit_solo,

      valid: true,
    };
    setFormData(Map(existingShift));
  }, [shift]);

  if (!context || !context.tournament) {
    return '';
  }

  // const addEvent = (event) => {
  //   event.preventDefault();
  //   const newEventsList = formData.get('events').concat({event: '', day: '', time: ''});
  //   const newFormData = formData.withMutations(map => {
  //     map.set('events', newEventsList).set('valid', false);
  //   });
  //   setFormData(newFormData);
  // }

  const allowDelete = shift && (context.tournament.state !== 'active' || context.tournament.state !== 'demo');

  const addClicked = (event) => {
    event.preventDefault();
    setFormDisplayed(true);
  }

  const formCancelled = (event) => {
    event.preventDefault();
    setFormDisplayed(false);
  }

  const inputChanged = (event) => {
    let newValue = '';
    let inputName = event.target.name;
    switch (inputName) {
      case 'capacity':
      // case 'display_order':
        newValue = parseInt(event.target.value);
        break;
      case 'permit_new_teams':
      case 'permit_joins':
      case 'permit_solo':
        newValue = event.target.checked;
        break;
      // case 'name':
      //   newValue = event.target.value;
      //   break;
      default:
        // TODO: fix this for tournaments with multiple shifts
        // const parts = inputName.split('_');
        // const index = parseInt(parts[1]);
        // const element = parts[2];
        // const value = event.target.value;
        // console.log(`Event ${index} ${element}`, value);
        // inputName = 'events';
        // newValue = formData.get('events').slice();
        // newValue[index][element] = value;
        break;
    }
    const newFormData = formData.withMutations(map => {
      map.set(inputName, newValue).set('valid', isValid(map));
    });
    setFormData(newFormData);
  }

  const isValid = (data) => {
    // TODO: accommodate tournaments with multiple shifts
    // return data.get('name').length > 0 &&
    return data.get('capacity') > 0; // && data.get('display_order') > 0;
  }

  const addShiftFormSubmitted = (event) => {
    event.preventDefault();

    const uri = `/director/tournaments/${context.tournament.identifier}/shifts`;
    const requestConfig = {
      method: 'post',
      data: {
        shift: {
          capacity: formData.get('capacity'),
          // name: formData.get('name'),
          // display_order: formData.get('display_order'),
          details: {
            // events: formData.get('events'),
            permit_new_teams: formData.get('permit_new_teams'),
            permit_solo: formData.get('permit_solo'),
            permit_joins: formData.get('permit_joins'),
          }
        }
      }
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: context,
      router: router,
      onSuccess: addShiftSuccess,
      onFailure: addShiftFailure,
    });
  }

  const addShiftSuccess = (data) => {
    const tournament = {...context.tournament};
    tournament.shifts = context.tournament.shifts.concat(data);
    context.setTournament(tournament);
  }

  const addShiftFailure = (data) => {
    console.log('damn', data);
  }

  const outerClasses = [classes.ShiftForm];
  if (formDisplayed) {
    outerClasses.push(classes.FormDisplayed);
  }

  const toggleEdit = (event) => {
    event.preventDefault();
    setFormDisplayed(!formDisplayed);
  }

  const deleteShift = (event) => {
    event.preventDefault();
    if (!allowDelete) {
      return;
    }
    const uri = `/director/shifts/${shift.identifier}`;
    const requestConfig = {
      method: 'delete',
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: context,
      router: router,
      onSuccess: deleteShiftSuccess,
      onFailure: deleteShiftFailure,
    });
  }

  const deleteShiftSuccess = (data) => {
    const tournament = {...context.tournament};
    tournament.shifts = context.tournament.shifts.filter(s => s.identifier !== shift.identifier);
    context.setTournament(tournament);
    // Anything else we need to do? I'm pretty sure a re-render will take this component instance away entirely...
  }

  const deleteShiftFailure = (data) => {
    console.log("Uh oh...", data);
  }

  const updateShiftFormSubmitted = (event) => {
    event.preventDefault();

    const uri = `/director/shifts/${shift.identifier}`;
    const requestConfig = {
      method: 'patch',
      data: {
        shift: {
          capacity: formData.get('capacity'),
          // name: formData.get('name'),
          // display_order: formData.get('display_order'),
          details: {
            // events: formData.get('events'),
            permit_new_teams: formData.get('permit_new_teams'),
            permit_solo: formData.get('permit_solo'),
            permit_joins: formData.get('permit_joins'),
          }
        }
      }
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      context: context,
      router: router,
      onSuccess: updateShiftSuccess,
      onFailure: updateShiftFailure,
    })
  }

  const updateShiftSuccess = (data) => {
    const tournament = {...context.tournament};
    tournament.shifts = [...context.tournament.shifts];
    const index = tournament.shifts.findIndex(s => s.identifier === shift.identifier)
    tournament.shifts[index] = data;
    context.setTournament(tournament);
    setSuccessMessage('Shift updated.');
    setFormDisplayed(false);
  }

  const updateShiftFailure = (data) => {
    console.log('damn', data);
  }

  let submitFunction = addShiftFormSubmitted;
  let colorClass = '';
  if (shift) {
    submitFunction = updateShiftFormSubmitted;
    if (shift.confirmed_count === shift.capacity) {
      colorClass = classes.Full;
    } else if (shift.confirmed_count + shift.requested_count + 16 >= shift.capacity) {
      colorClass = classes.AlmostFull;
    }
  }

  const registrationKinds = [
    {key: 'permit_new_teams', label: 'New Teams'},
    {key: 'permit_solo', label: 'Solo Entries'},
    {key: 'permit_joins', label: 'Join a Team'},
  ];

  // const daysOfWeek = [
  //   {value: 'Monday', display: 'Mon'},
  //   {value: 'Tuesday', display: 'Tue'},
  //   {value: 'Wednesday', display: 'Wed'},
  //   {value: 'Thursday', display: 'Thu'},
  //   {value: 'Friday', display: 'Fri'},
  //   {value: 'Saturday', display: 'Sat'},
  //   {value: 'Sunday', display: 'Sun'},
  // ];

  return (
    <div className={outerClasses.join(' ')}>
      {!formDisplayed && !shift &&
        <Card.Body>
          <div className={'text-center'}>
            <button type={'button'}
                    className={'btn btn-outline-primary'}
                    role={'button'}
                    onClick={addClicked}>
              <i className={'bi-plus-lg'} aria-hidden={true}/>{' '}
              Add
            </button>
          </div>
        </Card.Body>
      }
      {!formDisplayed && shift &&
        <a href={'#'}
           className={'text-body text-decoration-none'}
           title={'Edit details'}
           onClick={toggleEdit}>
          <dl className={classes.ExistingShift}>
            {/*<div className={'row'}>*/}
            {/*  <dt className={'col-4'}>*/}
            {/*    Order*/}
            {/*  </dt>*/}
            {/*  <dd className={'col'}>*/}
            {/*    {shift.display_order}*/}
            {/*  </dd>*/}
            {/*</div>*/}
            {/*<div className={'row'}>*/}
            {/*  <dt className={'col-4'}>*/}
            {/*    Name*/}
            {/*  </dt>*/}
            {/*  <dd className={'col'}>*/}
            {/*    {shift.name}*/}
            {/*  </dd>*/}
            {/*</div>*/}

            {/*<div className={'row'}>*/}
            {/*  <dt className={'col-4'}>*/}
            {/*    Events*/}
            {/*  </dt>*/}
            {/*  <dd className={'col'}>*/}
            {/*    {shift.events.map(event => (*/}
            {/*      <p className={'mb-2'}>*/}
            {/*        {event.event}: {event.day}, {event.time}*/}
            {/*      </p>*/}
            {/*    ))}*/}
            {/*  </dd>*/}
            {/*</div>*/}

            <div className={`row ${colorClass}`}>
              <dt className={'col-4'}>
                Capacity
              </dt>
              <dd className={'col'}>
                {shift.capacity} bowlers
              </dd>
            </div>
            <div className={`row ${colorClass}`}>
              <dt className={'col-4'}>
                # Confirmed
              </dt>
              <dd className={'col'}>
                {shift.confirmed_count}
              </dd>
            </div>
            <div className={`row ${colorClass}`}>
              <dt className={'col-4'}>
                # Requested
              </dt>
              <dd className={'col'}>
                {shift.requested_count}
              </dd>
            </div>

            <div className={'row'}>
              <dt className={'col-4'}>
                Enabled Entry Types
              </dt>
              <dd className={'col'}>
                {registrationKinds.map(kind => (
                  <div className={'d-block'} key={kind.key}>
                    {shift[kind.key] && (
                      <span className={'pe-1'}>
                        <i className={'bi-check-lg text-success'} aria-hidden={true}/>
                        <span className={'visually-hidden'}>Yes</span>
                      </span>
                    )}
                    {!shift[kind.key] && (
                      <span className={'pe-1'}>
                        <i className={'bi-x-lg text-danger'} aria-hidden={true}/>
                        <span className={'visually-hidden'}>No</span>
                      </span>
                    )}
                    {kind.label}
                  </div>
                ))}
              </dd>
            </div>
          </dl>
        </a>
      }
      {formDisplayed &&
        <Card.Body>
          <form onSubmit={submitFunction}>
            {/*<div className={'row mb-3'}>*/}
            {/*  <label htmlFor={'name'}*/}
            {/*         className={'form-label mb-1'}>*/}
            {/*    Name*/}
            {/*  </label>*/}
            {/*  <div className={'col'}>*/}
            {/*    <input type={'text'}*/}
            {/*           className={'form-control'}*/}
            {/*           name={'name'}*/}
            {/*           id={'name'}*/}
            {/*           required={false}*/}
            {/*           placeholder={'only necessary with multiple shifts'}*/}
            {/*           onChange={inputChanged}*/}
            {/*           value={formData.get('name')}*/}
            {/*    />*/}
            {/*  </div>*/}
            {/*</div>*/}

            {/*<div className={'row mb-3'}>*/}
            {/*  <label className={'form-label mb-1 col-12'}>*/}
            {/*    Events*/}
            {/*  </label>*/}
            {/*  {formData.get('events').length === 0 && (*/}
            {/*    <div className={`${classes.SubLabel} row m-0 py-0 ps-3 pe-0 ms-1`}>*/}
            {/*      <label>*/}
            {/*        (only necessary with multiple shifts)*/}
            {/*      </label>*/}
            {/*    </div>*/}
            {/*  )}*/}
            {/*  {formData.get('events').length > 0 && (*/}
            {/*    <div className={`${classes.SubLabel} row m-0 py-0 ps-3 pe-0 ms-1`}>*/}
            {/*      <div className={'col-5 p-0'}>*/}
            {/*        <label>Name</label>*/}
            {/*      </div>*/}
            {/*      <div className={'col-3 p-0'}>*/}
            {/*        <label>Day</label>*/}
            {/*      </div>*/}
            {/*      <div className={'col py-0 pe-3 ps-0'}>*/}
            {/*        <label>Time</label>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  )}*/}
            {/*  {formData.get('events').map((event, i) => (*/}
            {/*    <div key={i} className={'row m-0 py-0 ps-3 pe-0'}>*/}
            {/*      <div className={'col-5 p-0'}>*/}
            {/*        <input type={'text'}*/}
            {/*               className={'form-control'}*/}
            {/*               id={`events_${i}_event`}*/}
            {/*               placeholder={'Name'}*/}
            {/*               name={`events_${i}_event`}*/}
            {/*               value={formData.get('events')[i]['event']}*/}
            {/*               onChange={inputChanged}/>*/}
            {/*      </div>*/}
            {/*      <div className={'col-3 p-0'}>*/}
            {/*        <select className={'form-select'}*/}
            {/*                id={`events_${i}_day`}*/}
            {/*                name={`events_${i}_day`}*/}
            {/*                onChange={inputChanged}>*/}
            {/*          {daysOfWeek.map((day, j) => (*/}
            {/*            <option key={j}*/}
            {/*                    value={day.value}*/}
            {/*                    selected={formData.get('events')[i]['day'] === day.value}>*/}
            {/*              {day.display}*/}
            {/*            </option>*/}
            {/*          ))}*/}
            {/*        </select>*/}
            {/*      </div>*/}
            {/*      <div className={'col py-0 pe-3 ps-0'}>*/}
            {/*        <input type={'text'}*/}
            {/*               className={'form-control'}*/}
            {/*               id={`events_${i}_time`}*/}
            {/*               placeholder={'Time'}*/}
            {/*               name={`events_${i}_time`}*/}
            {/*               value={formData.get('events')[i]['time']}*/}
            {/*               onChange={inputChanged}/>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  ))}*/}
            {/*  <a href={'#'}*/}
            {/*     className={`${classes.AddEvent} ps-3 ms-1 pt-1`}*/}
            {/*     onClick={addEvent}>*/}
            {/*    add event*/}
            {/*  </a>*/}
            {/*</div>*/}

            <div className={'row mb-3'}>
              <div className={'col-6 text-end'}>
                <label htmlFor={'capacity'} className={'col-form-label ps-0 mb-1'}>
                  Capacity (bowlers)
                </label>
              </div>
              <div className={'col-6'}>
                <input type={'number'}
                       className={'form-control'}
                       name={'capacity'}
                       id={'capacity'}
                       required={true}
                       onChange={inputChanged}
                       value={formData.get('capacity')}
                />
              </div>
              {/*<div className={'col-6'}>*/}
              {/*  <label htmlFor={'display_order'} className={'form-label ps-0 mb-1'}>*/}
              {/*    Display Order*/}
              {/*  </label>*/}
              {/*  <input type={'number'}*/}
              {/*         className={'form-control'}*/}
              {/*         name={'display_order'}*/}
              {/*         id={'display_order'}*/}
              {/*         required={true}*/}
              {/*         onChange={inputChanged}*/}
              {/*         value={formData.get('display_order')}*/}
              {/*  />*/}
              {/*</div>*/}
            </div>
            <div className={'row mb-3'}>
              <div className={'col-6 text-end'}>
                <label>
                  Enabled Registrations
                </label>
              </div>
              <div className={'col-6'}>
                {registrationKinds.map(kind => (
                  <div className={'form-check form-switch'} key={kind.key}>
                    <input type={'checkbox'}
                           className={'form-check-input'}
                           role={'switch'}
                           id={kind.key}
                           name={kind.key}
                           checked={formData.get(kind.key)}
                           onChange={inputChanged}/>
                    <label htmlFor={kind.key}
                           className={'form-check-label'}>
                      {kind.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className={'row'}>
              <div className={'d-flex justify-content-end'}>
                {allowDelete && (
                  <button type={'button'}
                          title={'Delete'}
                          onClick={deleteShift}
                          className={'btn btn-danger me-auto'}>
                    <i className={'bi-slash-circle pe-2'} aria-hidden={true}/>
                    Delete
                  </button>
                )}
                <button type={'button'}
                        title={'Cancel'}
                        onClick={formCancelled}
                        className={'btn btn-outline-dark me-2'}>
                  <i className={'bi-x-lg'} aria-hidden={true}/>
                  <span className={'visually-hidden'}>
                    Cancel
                  </span>
                </button>
                <button type={'submit'}
                        title={'Save'}
                        disabled={!formData.get('valid')}
                        className={'btn btn-success'}>
                  <i className={'bi-check-lg'} aria-hidden={true}/>
                  <span className={'visually-hidden'}>
                    Save
                  </span>
                </button>
              </div>
            </div>
          </form>
        </Card.Body>
      }
      {successMessage && (
        <div className={'alert alert-success alert-dismissible fade show d-flex align-items-center mt-3 mx-3'}
             role={'alert'}>
          <i className={'bi-check2-circle pe-2'} aria-hidden={true}/>
          <div className={'me-auto'}>
            {successMessage}
            <button type="button"
                    className={"btn-close"}
                    data-bs-dismiss="alert"
                    onClick={() => setSuccessMessage(null)}
                    aria-label="Close"/>
          </div>
        </div>
      )}

      {errorMessage}
    </div>
  )
}

export default ShiftForm;