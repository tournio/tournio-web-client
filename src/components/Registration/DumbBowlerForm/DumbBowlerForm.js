import Input from "../../ui/Input/Input";
import React, {useState, useEffect} from "react";
import {CountryDropdown} from "react-country-region-selector";
import titleCase from "voca/title_case";

import classes from './DumbBowlerForm.module.scss';

import dynamic from 'next/dynamic';
import {devConsoleLog, updateObject} from "../../../utils";
const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false }
);

const DumbBowlerForm = ({
  tournament,
  bowler,
  onBowlerSave,
  solo = false,
  submitButtonText = 'Next',
  fieldNames = ['firstName', 'lastName', 'nickname', 'email', 'phone'], // specifies which of the fields we know about to use
  fieldData = {}, // things that cannot be known at compile time, such as taken positions or values/labels for shifts
                        }) => {
  const valueForField = (field, defaultValue = '') => {
    if (!bowler) {
      return defaultValue;
    }
    if (typeof bowler[field] === 'undefined' || bowler[field] === null) {
      devConsoleLog('Accessing a null or undefined bowler property:', field);
      return defaultValue;
    }
    return bowler[field];
  }

  const initialFormData = {
    fields: {
      firstName: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('firstName'),
        },
        label: 'First name',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },
      lastName: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('lastName'),
        },
        label: 'Last name',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },
      nickname: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('nickname'),
          placeholder: 'if different from first name',
        },
        label: 'Preferred Name',
        validityErrors: [],
        valid: true,
        touched: false,
      },
      email: {
        elementType: 'input',
        elementConfig: {
          type: 'email',
          value: valueForField('email'),
        },
        label: 'Email address',
        validityErrors: [
          'valueMissing',
          'typeMismatch',
        ],
        errorMessages: {
          typeMismatch: "That's not a valid email address",
        },
        valid: bowler ? true : false,
        touched: false,
      },
      phone: {
        elementType: 'input',
        elementConfig: {
          type: 'tel',
          value: valueForField('phone'),
        },
        label: 'Phone number',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },

      usbcId: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('usbcId'),
          pattern: "\\d+-\\d+",
          placeholder: 'including the hyphen',
        },
        label: 'USBC ID',
        validityErrors: [
          'valueMissing',
          'patternMismatch',
        ],
        errorMessages: {
          patternMismatch: 'Just digits and a hyphen, e.g., 123-4567',
        },
        helper: {
          url: 'https://webapps.bowl.com/USBCFindA/Home/Member',
          text: 'Look up your USBC ID',
        },
        valid: bowler ? true : false,
        touched: false,
      },
      dateOfBirth: {
        elementType: 'combo',
        elementConfig: {
          elements: [
            {
              // Month
              identifier: 'month',
              elementType: 'select',
              elementConfig: {
                options: [
                  {
                    value: 1,
                    label: 'Jan'
                  },
                  {
                    value: 2,
                    label: 'Feb'
                  },
                  {
                    value: 3,
                    label: 'Mar'
                  },
                  {
                    value: 4,
                    label: 'Apr'
                  },
                  {
                    value: 5,
                    label: 'May'
                  },
                  {
                    value: 6,
                    label: 'Jun'
                  },
                  {
                    value: 7,
                    label: 'Jul'
                  },
                  {
                    value: 8,
                    label: 'Aug'
                  },
                  {
                    value: 9,
                    label: 'Sep'
                  },
                  {
                    value: 10,
                    label: 'Oct'
                  },
                  {
                    value: 11,
                    label: 'Nov'
                  },
                  {
                    value: 12,
                    label: 'Dec'
                  },
                ],
                value: valueForField('birthMonth', 1),
              },
              labelClasses: ['visually-hidden'],
              layoutClass: 'col-4 col-xl-3',
              label: 'Month',
              validityErrors: [
                'valueMissing',
              ],
              valid: true,
              touched: false,
            },
            {
              // Day
              identifier: 'day',
              elementType: 'select',
              elementConfig: {
                optionRange: {
                  min: 1,
                  max: 31,
                },
                value: valueForField('birthDay', 1),
              },
              labelClasses: ['visually-hidden'],
              layoutClass: 'col-4 col-xl-3',
              label: 'Day',
              validityErrors: [
                // 'valueMissing',
              ],
              valid: true,
              touched: false,
            },
            {
              // Year
              identifier: 'year',
              elementType: 'select',
              elementConfig: {
                optionRange: {
                  min: 1900,
                  max: 2010,
                },
                value: valueForField('birthYear', 1976),
              },
              labelClasses: ['visually-hidden'],
              layoutClass: 'col-4 col-xl-3',
              label: 'Year',
              validityErrors: [
                // 'valueMissing',
              ],
              valid: true,
              touched: false,
            }
          ],
        },
        label: 'Date of Birth',
        validityErrors: ['valueMissing'],
        valid: true,
        touched: false,
      },
      address1: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('address1'),
          autoComplete: 'address-line1',
        },
        label: 'Mailing Address',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },
      address2: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('address2'),
          autoComplete: 'address-line2',
        },
        label: 'Unit / Apt No.',
        validityErrors: [],
        valid: true,
        touched: false,
      },
      city: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('city'),
          autoComplete: 'address-level2',
        },
        label: 'City/Town',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },
      state: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('state'),
          autoComplete: 'address-level1',
        },
        label: 'State/Province',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },
      country: {
        elementType: 'component',
        elementConfig: {
          // autoComplete: 'country', // (this component is not compatible with autoComplete)
          component: CountryDropdown,
          value: valueForField('country', 'US'),
          classNames: ['form-select'],
          props: {
            name: 'country',
            valueType: 'short',
            priorityOptions: ['US', 'CA', 'NZ'],
            defaultOptionLabel: '-- Choose your country',
          },
        },
        label: 'Country',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },
      postalCode: {
        elementType: 'input',
        elementConfig: {
          type: 'text',
          value: valueForField('postalCode'),
          autoComplete: 'postal-code',
        },
        label: 'ZIP/Postal Code',
        validityErrors: [
          'valueMissing',
        ],
        valid: bowler ? true : false,
        touched: false,
      },
      paymentApp: {
        elementType: 'combo',
        elementConfig: {
          elements: [
            {
              // App name
              identifier: 'app',
              elementType: 'select',
              elementConfig: {
                options: [
                  {
                    value: '',
                    label: ' --',
                  },
                  {
                    value: 'PayPal',
                    label: 'PayPal',
                  },
                  {
                    value: 'Venmo',
                    label: 'Venmo',
                  },
                  {
                    value: 'Zelle',
                    label: 'Zelle',
                  },
                ],
                value: valueForField('paymentApp'),
              },
              labelClasses: ['visually-hidden'],
              layoutClass: 'col-5 col-md-4 col-xl-3',
              label: 'App Name',
              validityErrors: [],
              valid: true,
              touched: false,
            },
            {
              // Account name
              identifier: 'account',
              elementType: 'input',
              elementConfig: {
                type: 'text',
                value: valueForField('paymentAccount'),
                placeholder: '@username / email / phone',
              },
              layoutClass: 'col',
              labelClasses: ['visually-hidden'],
              label: 'Account Name',
              validityErrors: [],
              valid: true,
              touched: false,
            }
          ],
        },
        label: 'Payment App',
        helper: {
          text: 'The tournament will try to pay you this way, rather than mail a check',
        },
        validityErrors: [],
        valid: true,
        touched: false,
      },

      position: {
        elementType: 'radio',
        elementConfig: {
          // Filled by data in fieldData
          // choices: [],

          // Filled by data in fieldData (or bowler, which takes precedence for edits)
          // value: 0,
        },
        label: 'Position',
        validityErrors: [
          'valueMissing',
        ],
        valid: true,
        touched: false,
      },
      // TODO: use the two shift forms for shift identifier(s)
      // shiftIdentifiers: {
      //   elementType: 'select',
      //   elementConfig: {
      //     // Filled by data in fieldData
      //     options: [],
      //     value: [],
      //   },
      //   label: 'Shift Preference',
      //   validityErrors: [
      //     'valueMissing',
      //   ],
      //   valid: true,
      //   touched: false,
      // },

      // Having this allows us to hang on to the doubles partner assignment across edits
      doublesPartnerIndex: {
        elementType: 'none',
        elementConfig: {
          value: null,
        },
        label: 'Doubles Partner',
        validityErrors: [],
        valid: true,
        touched: false,
      }
    },
    valid: bowler ? true : false,
    touched: false,
  }
  const [formData, setFormData] = useState(initialFormData);

  const getAdditionalQuestionFields = () => {
    const newFormFields = {};
    tournament.additionalQuestions.forEach(q => {
      const key = q.name;
      const field = {
        ...q,
        elementConfig: {
          ...q.elementConfig,
          value: valueForField(key),
        },
        validityErrors: [],
        valid: true,
        touched: false,
      };
      if (q.validation.required) {
        field.validityErrors = ['valueMissing'];
        field.valid = false;
      }
      newFormFields[key] = field;
    });
    return newFormFields;
  }

  useEffect(() => {
    if (!tournament) {
      return;
    }
    setFormData(updateObject(formData, {
      fields: {
        ...formData.fields,
        ...getAdditionalQuestionFields(),
      },
    }));
  }, [tournament]);

  if (!tournament) {
    return '';
  }

  ////////////////////////

  // Resets all values in the form data.
  const clearFormData = () => {
    const newFormData = {
      fields: {
        ...initialFormData.fields,
        ...getAdditionalQuestionFields(),
      },
      valid: false,
      touched: false,
    }
    setFormData(newFormData);
  }

  const validityForField = (failedChecks = []) => {
    return {
      validated: true,
      valid: failedChecks.length === 0,
      validityFailures: failedChecks,
    }
  }

  const inputChangedHandler = (event) => {
    let inputName;
    if (event.target) {
      inputName = event.target.name.split(' ')[0];
    } else {
      inputName = 'country';
    }

    // Create a copy of the bowler form; this is where we'll make updates
    const updatedBowlerForm = {
      ...formData,
      // Deep(ish)-copy the fields property, because it's complex
      fields: { ...formData.fields },
    };

    let failedChecks, checksToRun, validity;

    // Note: this may be a combo element, so don't do any other deep-copying of its elementConfig
    let updatedFormElement;

    switch (inputName) {
      case 'country':
        failedChecks = event.length === 0 ? ['valueMissing'] : [];
        updatedFormElement = {
          ...formData.fields.country,
          elementConfig: {
            ...formData.fields.country.elementConfig,
            value: event,
          },
          ...validityForField(failedChecks),
        }
        break;
      case 'dateOfBirth:month':
      case 'dateOfBirth:day':
      case 'dateOfBirth:year':
        const elemIdentifier = inputName.split(':')[1];

        const elems = [
          'month',
          'day',
          'year',
        ];
        const index = elems.findIndex(e => e === elemIdentifier);
        const dobElem = formData.fields.dateOfBirth.elementConfig.elements[index];

        updatedFormElement = {
          ...dobElem,
          elementConfig: {
            ...dobElem.elementConfig,
            value: event.target.value,
          },
          touched: true,
        }

        updatedBowlerForm.fields.dateOfBirth.elementConfig.elements[index] = updatedFormElement;
        break;
      case 'paymentApp:app':
      case 'paymentApp:account':
        const paymentElemIdentifier = inputName.split(':')[1];

        const elements = [
          'app',
          'account',
        ];
        const elemIndex = elements.findIndex(e => e === paymentElemIdentifier);
        const paymentElem = formData.fields.paymentApp.elementConfig.elements[elemIndex];

        updatedFormElement = {
          ...paymentElem,
          elementConfig: {
            ...paymentElem.elementConfig,
            value: event.target.value,
          },
          touched: true,
        }

        updatedBowlerForm.fields.paymentApp.elementConfig.elements[elemIndex] = updatedFormElement;
        break;
      default:
        checksToRun = formData.fields[inputName].validityErrors;
        validity = !!checksToRun ? event.target.validity : {};
        failedChecks = !!checksToRun ? checksToRun.filter(c => validity[c]) : [];

        updatedFormElement = {
          ...formData.fields[inputName],
          elementConfig: {...formData.fields[inputName].elementConfig},
          validated: false,
          ...validityForField(failedChecks)
        }
        if (formData.fields[inputName].elementType === 'checkbox') {
          updatedFormElement.elementConfig.value = event.target.checked ? 'yes' : 'no';
        } else if (inputName === 'position') {
          updatedFormElement.elementConfig.value = parseInt(event.target.value);
        } else {
          updatedFormElement.elementConfig.value = event.target.value;
        }
        break;
    }

    updatedFormElement.touched = true;

    // put the updated form element in the updated form
    // if it's not one of the combo elements
    const comboInputs = [
      'dateOfBirth:month',
      'dateOfBirth:day',
      'dateOfBirth:year',
      'paymentApp:app',
      'paymentApp:account',
    ];
    if (!comboInputs.includes(inputName)) {
      updatedBowlerForm.fields[inputName] = updatedFormElement;
    }

    updatedBowlerForm.touched = true;

    // Is the whole form valid?
    updatedBowlerForm.valid = fieldNames.every(fieldName => updatedBowlerForm.fields[fieldName].valid);
    if (!updatedBowlerForm.valid) {
      devConsoleLog("Something is invalid.", fieldNames.map(fname => `${fname}: ${updatedBowlerForm.fields[fname].valid}`));
    }

    setFormData(updatedBowlerForm);
  }

  const fieldBlurred = (event, inputName) => {
    const newFormData = {...formData}
    const fieldIsChanged = formData.fields[inputName].touched;

    const checksToRun = formData.fields[inputName].validityErrors;
    if (!checksToRun || !fieldIsChanged) {
      // Don't update validations if we've blurred but the input was never changed
      return;
    }

    const {validity} = event !== null ? event.target : {};
    const failedChecks = checksToRun.filter(c => validity[c]);

    newFormData.fields[inputName] = {
      ...newFormData.fields[inputName],
      ...validityForField(failedChecks),
    };

    // Now, determine whether the whole form is valid
    newFormData.valid = fieldNames.every(fieldName => newFormData.fields[fieldName].valid);

    setFormData(newFormData);
  }

  const formSubmitted = (event) => {
    event.preventDefault();

    if (!formData.valid) {
      return;
    }

    const bowlerData = {};
    for (let identifier in formData.fields) {
      // Pull in everything where the value is not undefined.
      // This gets everything except what's in combo elements.
      if (typeof formData.fields[identifier].elementConfig.value !== 'undefined') {
        bowlerData[identifier] = formData.fields[identifier].elementConfig.value;
      }

      // Now get the fields in combo elements, if needed.
      if (fieldNames.includes('dateOfBirth')) {
        formData.fields.dateOfBirth.elementConfig.elements.forEach(elem => {
          const key = 'birth' + titleCase(elem.identifier);
          bowlerData[key] = elem.elementConfig.value;
        });
      }

      // And payment app
      if (fieldNames.includes('paymentApp')) {
        formData.fields.paymentApp.elementConfig.elements.forEach(elem => {
          const key = 'payment' + titleCase(elem.identifier);
          bowlerData[key] = elem.elementConfig.value;
        });
      }
    }

    onBowlerSave(bowlerData);

    // Now, clear the form out to make room for the next bowler.
    clearFormData();
  }

  const mapboxTheme = {
    variables: {
      fontFamily: "var(--tournio-font-sans-serif)",
      colorBackground: "var(--tournio-body-bg)",
      colorBackgroundHover: "var(--tournio-secondary-bg-subtle)",
      colorText: "var(--tournio-body-color)",
    }
  };

  const inputElementForField = (fieldName) => {
    // On first render, the additional questions aren't there, so guard against there
    // being no field for the named field
    if (!formData.fields[fieldName]) {
      return null;
    }

    const formElement = formData.fields[fieldName];
    const validateOnBlur = formData.fields[fieldName].elementType !== 'select' && formData.fields[fieldName].validityErrors.length > 0;

    return (
      <Input
        key={`input_${fieldName}`}
        identifier={fieldName}
        elementType={formElement.elementType}
        elementConfig={formElement.elementConfig}
        changed={inputChangedHandler}
        label={formElement.label}
        labelClasses={formElement.labelClasses}
        layoutClass={formElement.layoutClass}
        helper={formElement.helper}
        validityErrors={formElement.validityErrors}
        errorMessages={formElement.errorMessages}
        // For <select> elements, onBlur is redundant to onChange
        blurred={validateOnBlur ? (event) => fieldBlurred(event, fieldName) : false}
        // formElement.validityFailures is added by validityForField
        failedValidations={typeof formElement.validityFailures !== 'undefined' ? formElement.validityFailures : []}
        wasValidated={formElement.validated}
      />
    );
  }

  return (
    <div className={classes.DumbBowlerForm}>
      <form onSubmit={formSubmitted}>
        {fieldNames.map(fieldName => {
          if (fieldName === 'address1') {
            return (
              <AddressAutofill key={'address-autofill'}
                               accessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
                               theme={mapboxTheme}>
                {inputElementForField(fieldName)}
              </AddressAutofill>
            )
          }
          return inputElementForField(fieldName);
        })}

        <p className={`${classes.RequiredLabel} text-md-center`}>
          <i className={`align-top bi-asterisk pe-1`}/>
          indicates a required field
        </p>

        <div className="d-flex flex-row-reverse justify-content-between pt-2">
          <button className="btn btn-primary btn-lg" type="submit" disabled={!formData.valid}>
            {submitButtonText}
            <i className="bi bi-chevron-double-right ps-2" aria-hidden="true"/>
          </button>
        </div>
      </form>
    </div>
  );
}

export default DumbBowlerForm;
