import {useState} from "react";

import {directorApiRequest, useTournament} from "../../../director";
import {useLoginContext} from "../../../store/LoginContext";
import ErrorBoundary from "../../common/ErrorBoundary";
import Item from "../../Commerce/AvailableItems/Item/Item";
import ButtonRow from "../../common/ButtonRow";

import classes from './MultiUseForm.module.scss';

const BanquetForm = ({onCancel, onComplete}) => {
  const {authToken} = useLoginContext();
  const {tournament} = useTournament();

  const initialState = {
    name: '',
    value: '',
    note: '',
    order: '',

    valid: false,
  }

  const [formData, setFormData] = useState(initialState);

  const inputChanged = (event) => {
    let newValue = event.target.value;
    const inputName = event.target.name;
    if (inputName === 'value' || inputName === 'order') {
      newValue = parseInt(newValue);
    }
    const newFormData = {...formData};
    newFormData[inputName] = newValue;

    newFormData.valid = isValid(newFormData);

    setFormData(newFormData);
  }

  const isValid = (data) => {
    return data.name.length > 0
      && data.value > 0
      && data.order > 0;
  }

  const submissionSuccess = (data) => {
    setFormData({...initialState});
    onComplete(data);
  }

  const formSubmitted = (event) => {
    event.preventDefault();
    const uri = `/tournaments/${tournament.identifier}/purchasable_items`;
    const requestConfig = {
      method: 'post',
      data: {
        purchasable_items: [
          {
            category: 'banquet',
            name: formData.name,
            value: formData.value,
            configuration: {
              order: formData.order,
              note: formData.note,
            },
          },
        ],
      },
    };
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: submissionSuccess,
      onFailure: (_) => console.log("Failed to save new banquet item."),
    });
  }

  let itemPreview = '';
  const itemPreviewProps = {
    category: 'banquet',
    name: formData.name,
    value: formData.value,
    configuration: {
      note: formData.note,
      order: formData.order,
    }
  }

  itemPreview = (
    <div className={'row mx-0 px-0'}>
      <span className={`${classes.PreviewText} px-0 pb-1`}>
        How it will look to bowlers:
      </span>
      <Item item={itemPreviewProps} preview={true}/>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className={classes.MultiUseForm}>
        <form onSubmit={formSubmitted} className={`py-2`}>
          <div className={`${classes.HeaderRow} row mb-2`}>
            <h6>
              New Banquet Item
            </h6>
          </div>
          <div className={'row mb-3'}>
            <label htmlFor={'name'} className={'form-label ps-0 mb-1'}>
              Display Name
            </label>
            <input type={'text'}
                   className={`form-control`}
                   name={'name'}
                   id={'name'}
                   required={true}
                   onChange={(event) => inputChanged(event)}
                   value={formData.name}
            />
          </div>
          <div className={'row mb-3'}>
            <div className={'col-6 ps-0'}>
              <label htmlFor={'value'} className={'form-label ps-0 mb-1'}>
                Price
              </label>
              <input type={'number'}
                     className={`form-control`}
                     name={'value'}
                     id={'value'}
                     required={true}
                     onChange={(event) => inputChanged(event)}
                     value={formData.value}
              />
            </div>
            <div className={'col-6 pe-0'}>
              <label htmlFor={'order'} className={'form-label ps-0 mb-1'}>
                Display Order
              </label>
              <input type={'number'}
                     className={`form-control`}
                     name={'order'}
                     id={'order'}
                     required={true}
                     onChange={(event) => inputChanged(event)}
                     value={formData.order}
              />
            </div>
          </div>
          <div className={'row mb-3'}>
            <label htmlFor={'note'} className={'form-label ps-0 mb-1'}>
              Note (optional)
            </label>
            <input type={'text'}
                   className={`form-control`}
                   name={'note'}
                   id={'note'}
                   onChange={(event) => inputChanged(event)}
                   value={formData.note}
            />
          </div>
          <div className={'row'}>
            {itemPreview}
          </div>

          <ButtonRow onCancel={onCancel} disableSave={!formData.valid} />
        </form>
      </div>
    </ErrorBoundary>
  );
}

export default BanquetForm;
