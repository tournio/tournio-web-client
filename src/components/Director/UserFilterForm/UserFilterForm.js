import {useState} from 'react';

import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import {Col, Row} from "react-bootstrap";

import classes from './UserFilterForm.module.scss';

const UserFilterForm = ({onFilterApplication, onFilterReset, tournamentOrgs}) => {
  const initialState = {
    email: '',
    tournamentOrgId: '',
    has_no_tournament_org: false,
    has_not_signed_in: false,
  }

  const [filterForm, setFilterForm] = useState(initialState);

  if (!tournamentOrgs) {
    return '';
  }

  const formHandler = (event) => {
    event.preventDefault();

    const formData = {...filterForm};

    onFilterApplication(formData);
  }

  const inputChangedHandler = (event, inputIdentifier) => {
    const updatedForm = { ...filterForm };

    switch (inputIdentifier) {
      case 'email':
      case 'tournamentOrgId':
        updatedForm[inputIdentifier] = event.target.value;
        if (event.target.value.length > 0) {
          updatedForm['has_no_tournament_org'] = false;
        }
        break;
      case 'has_no_tournament_org':
      case 'has_not_signed_in':
        const oldValue = filterForm[inputIdentifier];
        const newValue = !oldValue;
        updatedForm[inputIdentifier] = newValue;
        if (inputIdentifier === 'has_no_tournament_org' && newValue) {
          updatedForm['tournamentOrgId'] = '';
        }
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
    <Form onSubmit={formHandler} className={'p-3 col-md-10 offset-md-1'} >
      <Form.Group controlId={'tournamentOrgId'}
                  as={Row}
                  className={'mb-3'}>
        <Form.Label column sm={4} className={'d-none d-sm-block text-end'}>
          Tournament Org
        </Form.Label>
        <Col>
          <Form.Select value={filterForm.tournamentOrgId}
                       onChange={(event) => inputChangedHandler(event, 'tournamentOrgId')}>
            <option value={''}>--</option>
            {tournamentOrgs.map(t => <option key={t.identifier} value={t.id}>{t.name}</option>)}
          </Form.Select>
        </Col>
      </Form.Group>
      <Form.Group controlId={'email'}
                  as={Row}
                  className={'mb-3'}>
        <Form.Label column sm={4} className={'d-none d-sm-block text-end'}>
          Email
        </Form.Label>
        <Col>
          <Form.Control type={'text'}
                        placeholder={'Email'}
                        value={filterForm.email}
                        onChange={(event) => inputChangedHandler(event, 'email')}
          />
        </Col>
      </Form.Group>
      <Row>
        <Col>
          <Form.Group controlId={'has_no_tournament_org'}
                      as={Row}
                      className={'mb-3'}>
            <Col sm={{span: 8, offset: 4}}>
              <Form.Check type={'checkbox'}
                          label={'No tournament associated'}
                          checked={filterForm.has_no_tournament_org}
                          onChange={(event) => inputChangedHandler(event, 'has_no_tournament_org')}
              />
            </Col>
          </Form.Group>
          <Form.Group controlId={'has_not_signed_in'}
                      as={Row}
                      className={'mb-3'}>
            <Col sm={{span: 8, offset: 4}}>
              <Form.Check type={'checkbox'}
                          label={'Never signed in'}
                          checked={filterForm.has_not_signed_in}
                          onChange={(event) => inputChangedHandler(event, 'has_not_signed_in')}
              />
            </Col>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group as={Row}>
        <Col className={'d-flex justify-content-evenly'}>
          <Button variant={'primary'} type={'submit'}>
            Apply Filters
          </Button>
          <Button variant={'secondary'}
                  type={'button'}
                  onClick={resetFilterHandler}
          >
            Reset Filters
          </Button>
        </Col>
      </Form.Group>
    </Form>
  );

  return (
    <div className={classes.UserFilterForm}>
      {form}
    </div>
  )
};

export default UserFilterForm;
