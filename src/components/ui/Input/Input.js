import React from 'react';

import classes from './Input.module.scss';
import {Collapse} from "react-bootstrap";

const Input = (props) => {
  let inputElement = null;

  const required = props.validityErrors && props.validityErrors.includes('valueMissing');
  const errorMessages = props.failedValidations.map(fv => {
    // If there's a specified error message for the failed validation, return it.
    if (props.errorMessages && props.errorMessages[fv]) {
      return props.errorMessages[fv];
    }
    // Otherwise, go with a generic one using the switch.
    switch(fv) {
      case 'valueMissing':
        return 'We need something here.';
      case 'patternMismatch':
        return "That doesn't look quite right";
      case 'typeMismatch':
        return "That doesn't look quite right";
      case 'rangeUnderflow':
        return 'Too low';
      case 'rangeOverflow':
        return 'Too high';
      case 'tooLong':
        return 'Too long';
      case 'tooShort':
        return 'Too short';
      default:
        return 'Please enter a valid value';
    }
  });

  // Classes for the outer label (not for checkboxes/radios)
  const outerLabelClasses = [
    "col-12",
    "col-sm-5",
    "text-sm-end",
    "pb-1",
    // "col-form-label",
  ];

  // Classes to put on div.col that contains the input element and its other stuff
  const columnClasses = [];

  // Class(es) to drive layout. Allows child Input elements to be arranged differently
  const layoutClass = props.layoutClass ? props.layoutClass : 'row';

  switch (props.elementType) {
    case('readonly'):
      outerLabelClasses.push("col-form-label");
      inputElement = <input
        id={props.identifier}
        name={props.identifier}
        type={'text'}
        readOnly={true}
        className={`form-control-plaintext`}
        value={props.elementConfig.value}
      />
      break;
    case('input'):
      outerLabelClasses.push("col-form-label");
      if (props.labelClasses) {
        outerLabelClasses.push(...props.labelClasses);
      }
      inputElement = <input
        id={props.identifier}
        name={props.identifier}
        className={`form-control`}
        maxLength="1000"
        {...props.elementConfig}
        value={props.elementConfig.value || ''}
        onChange={props.changed}
        onBlur={!!props.blurred ? props.blurred : () => {}}
        required={required}
      />
      break;
    case('select'):
      outerLabelClasses.push("col-form-label");
      if (props.labelClasses) {
        outerLabelClasses.push(...props.labelClasses);
      }
      let optionText;
      if (props.elementConfig.optionRange) {
        const options = [];
        const {min, max} = props.elementConfig.optionRange;
        for (let i = min; i <= max; i++) {
          options.push(<option value={i} key={`option_${i}`}>{i}</option>);
        }
        optionText = options;
      } else {
        optionText = props.elementConfig.options.map((option, i) => {
          return (
            <option value={option.value} key={i}>
              {option.label}
            </option>
          );
        });
      }
      inputElement = <select
        id={props.identifier}
        name={props.identifier}
        className={`form-select`}
        onChange={props.changed}
        required={required}
        value={props.elementConfig.value || ''}
      >
        {optionText}
      </select>
      break;
    case('combo'):
      outerLabelClasses.push("col-form-label");
      inputElement = (
        <div className={`row g-1`}>
          {props.elementConfig.elementOrder.map(elemIdentifier => {
            const elem = props.elementConfig.elements[elemIdentifier];
            return (
              <Input
                key={`${props.identifier}-${elemIdentifier}`}
                identifier={elemIdentifier}
                elementType={elem.elementType}
                elementConfig={elem.elementConfig}
                changed={props.changed}
                label={elem.label}
                labelClasses={elem.labelClasses}
                layoutClass={elem.layoutClass}
                helper={''}
                validityErrors={elem.validityErrors}
                errorMessages={elem.errorMessages}
                failedValidations={typeof elem.validityFailures !== 'undefined' ? elem.validityFailures : []}
                wasValidated={elem.validated}
                loading={false}
              />
            );
          })}
        </div>
      )
      break;
    case('component'):
      outerLabelClasses.push("col-form-label");
      const Component = props.elementConfig.component;
      const componentClasses = props.elementConfig.classNames.concat(errorMessages.length > 0 ? 'is-invalid' : []);
      inputElement = React.createElement(Component, {
          id: props.identifier,
          value: props.elementConfig.value,
          onChange: props.changed,
          classes: componentClasses.join(' '),
          ...props.elementConfig.props,
        }
      );
      break;
    case('checkbox'):
      columnClasses.push('d-flex', 'align-items-center'); // vertically center the checkbox
      inputElement = (
        <div className={`form-check`}>
          <input
            type={'checkbox'}
            className={'form-check-input'}
            id={props.identifier}
            name={props.identifier}
            onChange={props.changed}
            {...props.elementConfig}
            checked={props.elementConfig.value === 'yes' || props.elementConfig.value === true}
          />
          <label className={'form-check-label'} htmlFor={props.identifier}>
            {props.elementConfig.label}
          </label>
        </div>
      );
      break;
    case('radio'):
      columnClasses.push('d-flex', 'align-items-center'); // vertically center the radio button
    case('radio-limited-set'):
      columnClasses.push(classes.LimitedSetRadio);
      inputElement = props.elementConfig.choices.map((choice, i) => (
        <div className={`form-check`} key={i}>
          <input type={'radio'}
                 className={'form-check-input'}
                 required={required}
                 value={choice.value}
                 disabled={choice.disabled}
                 onChange={props.changed}
                 checked={props.elementConfig.value === choice.value}
                 id={`${props.identifier}_${choice.value}`}
                 name={props.identifier}>
          </input>
          <label className={'form-check-label'}
                 htmlFor={`${props.identifier}_${choice.value}`}>
            {choice.label}
          </label>
        </div>
      ));
      break;
    case('none'):
      return null;
    default:
      console.log("I don't recognize that element type: " + props.elementType);
      return null;
  }

  // props:
  //   key={formElement.id}
  //   identifier={formElement.id}
  //   elementType={formElement.setup.elementType}
  //   elementConfig={formElement.setup.elementConfig}
  //   changed={(event) => inputChangedHandler(event, formElement.id)}
  //   label={formElement.setup.label}
  //   validityErrors={formElement.setup.validityErrors} (if any)
  //   blurred={(event) => fieldBlurred(event, formElement.id)} or blurred={false}
  //   failedValidations=[names of any validations that failed
  //   wasValidated={true/false}
  //  + everything in elementConfig (value, type)

  let helperElement = '';
  if (props.helper && props.helper.text) {
    let helper = props.helper.text;
    if (props.helper.url) {
      helper = (
        <a href={props.helper.url} target="_blank" rel="noreferrer">
          {props.helper.text}{' '}
          <i className={`${classes.ExternalLink} bi-box-arrow-up-right pl-2`} aria-hidden="true"/>
        </a>
      )
    }
    helperElement = (
      <small className="form-text text-secondary">
        {helper}
      </small>
    );
  }

  return (
    <div className={`${classes.Input} ${layoutClass} mb-1 mb-md-2`}>
      <label className={outerLabelClasses.join(' ')} htmlFor={props.identifier}>
        {props.label}
        {required && (
          <div className="d-inline">
            <i className={`${classes.RequiredLabel} align-top bi-asterisk`} />
            <span className="visually-hidden">
              This field is required.
            </span>
          </div>
        )}
      </label>
      <div className={`col ${columnClasses.join(' ')} ${props.wasValidated ? 'was-validated' : ''}`}>
        {inputElement}
        {helperElement}
        <Collapse in={errorMessages.length > 0}>
          <div className={`${classes.InvalidFeedback}`}>
            {errorMessages.map((e, i) => (
              <span className={"line"} key={`${props.identifier}_errorMsg_${i}`}>
              <i className="bi bi-x me-1" aria-hidden="true"/>
              <span>
                {e}
              </span>
            </span>
            ))}
          </div>
        </Collapse>
        {props.identifier === 'email' && (
          <Collapse in={props.loading}>
            <div className={`mt-1 ${classes.ValidationInProgress}`}>
              <span className={'spinner-grow spinner-grow-sm me-2'} role={'status'} aria-hidden={true}></span>
              Checking email address...
            </div>
          </Collapse>
        )}
      </div>
    </div>
  )
};

export default Input;
