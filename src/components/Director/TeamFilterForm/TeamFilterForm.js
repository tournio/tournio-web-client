import {useState} from 'react';

import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';

import classes from './TeamFilterForm.module.scss';
import {Row} from "react-bootstrap";
import Button from "react-bootstrap/Button";

const TeamFilterForm = (props) => {
  const initialState = {
    incomplete: false,
    place_with_others: false,
  }

  const [filterForm, setFilterForm] = useState(initialState);

  const inputChangedHandler = (event, inputIdentifier) => {
    const updatedForm = { ...filterForm };

    switch (inputIdentifier) {
      case 'incomplete':
      case 'place_with_others':
        const oldValue = filterForm[inputIdentifier];
        const newValue = !oldValue;
        updatedForm[inputIdentifier] = newValue;
        break;
      default:
        console.log('uhh...');
        break;
    }

    setFilterForm(updatedForm);
  }

  const resetFilterHandler = () => {
    setFilterForm(initialState);
    // props.onFilterApplication(initialState);
    props.onFilterReset();
  }

  const formHandler = (event) => {
    event.preventDefault();
    props.onFilterApplication(filterForm);
  }

  const form = (
    <Form className={'p-3 col-md-10 offset-md-1 col-lg-8 offset-lg-2'} onSubmit={formHandler}>
      <Row className={'mb-3'}>
        <Col sm={12}>
          <Form.Check type={'switch'}
                      id={'incomplete'}
                      name={'incomplete'}
                      label={'Incomplete teams only'}
                      checked={filterForm.incomplete}
                      onChange={(event) => inputChangedHandler(event, 'incomplete')}
          />
          <Form.Check type={'switch'}
                      id={'place_with_others'}
                      name={'place_with_others'}
                      label={'Wants committee to place others with them'}
                      checked={filterForm.place_with_others}
                      onChange={(event) => inputChangedHandler(event, 'place_with_others')}
          />
        </Col>
      </Row>

      <Form.Group as={Row}>
        <Col sm={{span: 9, offset: 3}} className={'d-flex'}>
          <Button variant={'dark'}
                  type={'submit'}
                  className={'me-2'}>
            Apply Filters
          </Button>
          <Button variant={'outline-dark'}
                  type={'button'}
                  className={'me-auto'}
                  onClick={resetFilterHandler}>
            Reset Filters
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );

  return (
    <div className={classes.TeamFilterForm}>
      {form}
    </div>
  )
};

export default TeamFilterForm;