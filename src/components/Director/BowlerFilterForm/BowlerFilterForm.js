import {useState} from 'react';

import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import {Col, FloatingLabel, Row} from "react-bootstrap";

import classes from './BowlerFilterForm.module.scss';

const BowlerFilterForm = ({onFilterApplication, onFilterReset, includeTeamFilters=true, showMoney=true}) => {
  const initialState = {
    name: '',
    email: '',
    amount_due: false,
    has_free_entry: false,
    igbo_member: '',
    no_team: '',
    no_partner: '',
  }

  const [filterForm, setFilterForm] = useState(initialState);

  const formHandler = (event) => {
    event.preventDefault();

    const formData = {...filterForm};

    onFilterApplication(formData);
  }

  const inputChangedHandler = (event, inputIdentifier) => {
    const updatedForm = { ...filterForm };

    switch (inputIdentifier) {
      case 'amount_due':
      case 'has_free_entry':
      case 'no_team':
      case 'no_partner':
        const oldValue = filterForm[inputIdentifier];
        const newValue = !oldValue;
        updatedForm[inputIdentifier] = newValue;
        break;
      case 'name':
      case 'email':
        updatedForm[inputIdentifier] = event.target.value;
        break;
      case 'igbo_member':
        updatedForm['igbo_member'] = event.target.value === 'true';
        break;
      default:
        console.log('uhh...');
        break;
    }

    setFilterForm(updatedForm);
  }

  const resetFilterHandler = () => {
    setFilterForm(initialState);
    // onFilterApplication(initialState);
    onFilterReset();
  }

  const form = (
    <Form onSubmit={formHandler} className={'p-3 col-md-10 offset-md-1 col-lg-8 offset-lg-2'} >
      <FloatingLabel label={'Name'}
                     controlId={'name_xs'}
                     className={'d-sm-none'}>
        <Form.Control type={'text'}
                      placeholder={'Name'}
                      value={filterForm.name}
                      onChange={(event) => inputChangedHandler(event, 'name')}
        />
      </FloatingLabel>
      <Form.Group controlId={'name'}
                  as={Row}
                  className={'mb-3'}>
        <Form.Label column sm={2} className={'d-none d-sm-block text-end'}>
          Name
        </Form.Label>
        <Col sm={10} className={'d-none d-sm-block'}>
          <Form.Control type={'text'}
                        placeholder={'Name'}
                        value={filterForm.name}
                        onChange={(event) => inputChangedHandler(event, 'name')}
          />
        </Col>
      </Form.Group>
      <FloatingLabel label={'Email'}
                     controlId={'email_xs'}
                     className={'d-sm-none'}>
        <Form.Control type={'text'}
                      placeholder={'Email'}
                      value={filterForm.email}
                      onChange={(event) => inputChangedHandler(event, 'email')}
        />
      </FloatingLabel>
      <Form.Group controlId={'email'}
                  as={Row}
                  className={'mb-3'}>
        <Form.Label column sm={2} className={'d-none d-sm-block text-end'}>
          Email
        </Form.Label>
        <Col sm={10} className={'d-none d-sm-block'}>
          <Form.Control type={'text'}
                        placeholder={'Email'}
                        value={filterForm.email}
                        onChange={(event) => inputChangedHandler(event, 'email')}
          />
        </Col>
      </Form.Group>
      <Row>
        <Col sm={6}>
          {showMoney && (
            <Form.Group controlId={'amount_due'}
                        as={Row}
                        className={'mb-3'}>
              <Col sm={{span: 8, offset: 4}}>
                <Form.Check type={'checkbox'}
                            label={'Not paid in full'}
                            checked={filterForm.amount_due}
                            onChange={(event) => inputChangedHandler(event, 'amount_due')}
                />
              </Col>
            </Form.Group>
          )}
          {showMoney && (
            <Form.Group controlId={'has_free_entry'}
                        as={Row}
                        className={'mb-3'}>
              <Col sm={{span: 8, offset: 4}}>
                <Form.Check type={'checkbox'}
                            label={'Has a free entry'}
                            checked={filterForm.has_free_entry}
                            onChange={(event) => inputChangedHandler(event, 'has_free_entry')}
                />
              </Col>
            </Form.Group>
          )}
          {includeTeamFilters && (
            <Form.Group controlId={'no_team'}
                        as={Row}
                        className={'mb-3'}>
              <Col sm={{span: 8, offset: 4}}>
                <Form.Check type={'checkbox'}
                            label={'Not on a team'}
                            checked={filterForm.no_team}
                            onChange={(event) => inputChangedHandler(event, 'no_team')}
                />
              </Col>
            </Form.Group>
          )}
          <Form.Group controlId={'no_partner'}
                      as={Row}
                      className={'mb-3'}>
            <Col sm={{span: 8, offset: 4}}>
              <Form.Check type={'checkbox'}
                          label={'No doubles partner'}
                          checked={filterForm.no_partner}
                          onChange={(event) => inputChangedHandler(event, 'no_partner')}
              />
            </Col>
          </Form.Group>

        </Col>
        <Col sm={6}>

          <Form.Group className={'mb-3'}>
            <Form.Label>
              IGBO Membership:
            </Form.Label>
              <Form.Check type={'radio'}
                          value={true}
                          label={'Verified'}
                          name={'igbo_member'}
                          id={'igbo_member_true'}
                          checked={filterForm.igbo_member === true}
                          onChange={(event) => inputChangedHandler(event, 'igbo_member')}
              />
              <Form.Check type={'radio'}
                          value={false}
                          label={'Unverified'}
                          name={'igbo_member'}
                          id={'igbo_member_false'}
                          checked={filterForm.igbo_member === false}
                          onChange={(event) => inputChangedHandler(event, 'igbo_member')}
              />
          </Form.Group>

        </Col>
      </Row>

      <Form.Group as={Row}>
        <Col sm={{span: 9, offset: 3}} className={'d-flex'}>
          <Button variant={'primary'}
                  type={'submit'}
          >
            Apply Filters
          </Button>
          <Button variant={'secondary'}
                  type={'button'}
                  className={'ms-auto'}
                  onClick={resetFilterHandler}
          >
            Reset Filters
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );

  return (
    <div className={classes.BowlerFilterForm}>
      {form}
    </div>
  )
};

export default BowlerFilterForm;
