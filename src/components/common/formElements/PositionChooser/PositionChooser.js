import classes from "./PositionChooser.module.scss";
import React, {useEffect, useState} from "react";
import {updateObject} from "../../../../utils";

const PositionChooser = ({maxPosition=4, chosen, onChoose}) => {
  const initialState = {
    chosen: 1,
  }

  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    if (chosen) {
      const updatedFormState = updateObject(formState, {
        chosen: parseInt(chosen),
      });
      setFormState(updatedFormState);
    }
  }, []);

  const inputChanged = (element, newValue) => {
    const updatedFormState = updateObject(formState, {
      chosen: newValue,
    });
    setFormState(updatedFormState);
    onChoose(newValue);
  }

  const radios = [];
  for (let i = 0; i < maxPosition; i++) {
    radios.push(
      <div key={`positionInput${i+1}`}>
        <input type={'radio'}
               className={'btn-check'}
               name={'position'}
               id={`position_${i+1}`}
               value={i+1}
               checked={formState.chosen === i+1}
               onChange={(e) => inputChanged(e, i+1)}
               autoComplete={'off'} />
        <label className={`btn btn-lg btn-outline-primary`}
               htmlFor={`position_${i+1}`}>
          {i+1}
        </label>
      </div>
    );
  }

  return (
    <div className={classes.PositionChooser}>
      <h4 className={classes.Title}>
        Position
      </h4>
      <div className={`d-flex justify-content-around`}>
        {radios}
      </div>
    </div>
  );
}

export default PositionChooser;