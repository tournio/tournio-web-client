import classes from './MixAndMatchShiftForm.module.scss';
import React, {useEffect, useState} from "react";
import {devConsoleLog, updateObject} from "../../../utils";

const MixAndMatchShiftForm = ({shiftsByEvent, onUpdate}) => {
  const initialFormValues = {
    fields: {},
  }

  const [componentState, setComponentState] = useState(initialFormValues);

  useEffect(() => {
    if (!shiftsByEvent) {
      return;
    }
    // Set the form to select the first (not full) shift in each group
    const formValues = {...initialFormValues}
    for (const eventStr in shiftsByEvent) {
      const availableShifts = shiftsByEvent[eventStr].filter(({is_full}) => !is_full)
      formValues.fields[eventStr] = availableShifts[0].identifier;
    }
    setComponentState(updateObject(componentState, {
        fields: {
          ...formValues.fields,
        }
      }));

    // Now convey that to our parent
    devConsoleLog("Telling parent about selected fields: ", Object.values(formValues.fields));
    onUpdate(Object.values(formValues.fields));
  }, [shiftsByEvent]);

  /////////////////////////////

  const inputUpdated = (event, groupString) => {
    // Update the component's state
    const updatedFields = {...componentState.fields}
    updatedFields[groupString] = event.target.value;
    setComponentState(updateObject(componentState, {
      fields: updatedFields,
    }));

    // Now convey that to our parent
    const shiftIdentifiers = Object.values(updatedFields);
    onUpdate(shiftIdentifiers);
  }

  {/* A set of radios for each event set */}
  const groups = [];
  for (const eventGroup in shiftsByEvent) {
    groups.push(
      <div className={classes.EventGroup} key={eventGroup}>
        <h4>
          {shiftsByEvent[eventGroup][0].group_title}
        </h4>

        {shiftsByEvent[eventGroup].map(({identifier, name, description, is_full}) => {
          const selected = componentState.fields[eventGroup] === identifier;

          return (
            <div key={`shiftInput_${identifier}`} className={`mx-lg-4 mb-1 form-check`}>
               <input type={'radio'}
                      className={'form-check-input'}
                      name={`${eventGroup}_shift`}
                      id={`shift_${identifier}`}
                      value={identifier}
                      onChange={(e) => inputUpdated(e, eventGroup)}
                      checked={selected}
                      disabled={!!is_full}
                      autoComplete={'off'}/>
               <label className={`form-check-label`}
                      htmlFor={`shift_${identifier}`}>
                 {!!is_full ? '[full]' : ''} {name}: {description}
               </label>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={classes.MixAndMatchShiftForm}>
      <h3>
        Shift Preferences
      </h3>
      {groups}
    </div>
  );
}

export default MixAndMatchShiftForm;
