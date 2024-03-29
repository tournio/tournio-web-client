import React, {useState, useEffect} from "react";
import {Alert, Button, Card, Form, FormGroup} from "react-bootstrap";
import {useRouter} from "next/router";

import {directorApiRequest} from "../../../director";

import classes from './UserForm.module.scss';
import {useLoginContext} from "../../../store/LoginContext";
import SuccessAlert from "../../common/SuccessAlert";
import ErrorAlert from "../../common/ErrorAlert";

const UserForm = ({user, tournamentOrgs = [], onUserAdded, onUserUpdated}) => {
  const {user: loggedInUser, authToken} = useLoginContext();
  const router = useRouter();

  const initialState = {
    fields: {
      email: '',
      role: 'director',
      firstName: '',
      lastName: '',
      tournamentOrgIds: [],
    },
    valid: false,
    touched: false,
  };

  const [errorMessage, setErrorMessage] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userFormData, setUserFormData] = useState(initialState);
  const [banner, setBanner] = useState(null);

  // If we're editing an existing user, then put the existing user's values into the form
  useEffect(() => {
    if (!user) {
      return;
    }

    const newUserFormData = {...userFormData};

    newUserFormData.fields.email = user.email;
    newUserFormData.fields.role = user.role;
    newUserFormData.fields.firstName = user.firstName || '';
    newUserFormData.fields.lastName = user.lastName || '';
    newUserFormData.fields.tournamentOrgIds = user.tournamentOrgs.map(o => o.id);

    const isSelf = user.identifier === loggedInUser.identifier;
    if (isSelf) {
      delete newUserFormData.fields.role;
      delete newUserFormData.fields.tournamentOrgIds;
    }

    newUserFormData.valid = true;

    setUserFormData(newUserFormData);
  }, [user]);

  ///////////////////////////////////////////////////////////////////////////

  if (!tournamentOrgs) {
    return '';
  }

  let areWeCreating = true;
  let deleteButton = '';
  let isSelf = false;
  let formTitle = 'New User';
  let submitButtonText = 'Create User';
  let submittingButtonText = 'Creating...';

  const onDeleteSuccess = (_) => {
    router.push('/director/users?success=deleted');
  }

  const onDeleteFailure = (data) => {
    setErrorMessage(`Failed to delete user. ${data.error}`);
  }

  const deleteInitiated = (e) => {
    e.preventDefault();
    if (confirm('This will remove the user and their ability to administer any tournaments. Are you sure?')) {
      const uri = `/users/${user.identifier}`;
      const requestConfig = {
        method: 'delete',
      }
      directorApiRequest({
        uri: uri,
        requestConfig: requestConfig,
        authToken: authToken,
        onSuccess: onDeleteSuccess,
        onFailure: onDeleteFailure,
      });
    }
  }

  if (user) {
    areWeCreating = false;
    isSelf = user.identifier === loggedInUser.identifier;

    formTitle = 'User Details';
    submitButtonText = 'Update';
    submittingButtonText = 'Updating...';

    if (!isSelf) {
      deleteButton = (
        <Card className={'mt-3'}>
          <Card.Body className={'text-center'}>
            <Button variant={'danger'}
                    type={'submit'}
                    onClick={deleteInitiated}
            >
              Delete User
            </Button>
          </Card.Body>
        </Card>
      );
    }
  }

  const onSubmitSuccess = (data) => {
    setIsSubmitting(false);
    setBanner(<Alert variant={'success'}
                     dismissible={true}
                     onClose={() => setBanner(null)}
                     className={'mt-3 mb-0'}>{areWeCreating ? 'User has been created!' : 'User details updated.'}</Alert>);

    if (areWeCreating) {
      setUserFormData(initialState);
      onUserAdded(data);
      setSuccessMessage('User created.');
    } else {
      onUserUpdated(data)
      setSuccessMessage('User details updated');

      // Update the touched attribute in the userDataForm back to false.
      const updatedForm = {...userFormData};
      updatedForm.fields = {...userFormData.fields};
      updatedForm.touched = false;
      setUserFormData(updatedForm);
    }
  }

  const onSubmitFailure = (data) => {
    setIsSubmitting(false);
    setErrorMessage(`Failed to save. ${data.error}`);
  }

  const submitHandler = (event) => {
    event.preventDefault();

    let uri = `/users`;
    let method = 'post';
    const userData = {
      email: userFormData.fields.email,
      first_name: userFormData.fields.firstName,
      last_name: userFormData.fields.lastName,
    }

    if (!areWeCreating) {
      uri += `/${user.identifier}`;
      method = 'patch';
    }

    if (!isSelf) {
      const tournamentOrgIds = [];
      for (const option of userFormData.fields.tournamentOrgIds) {
        tournamentOrgIds.push(option);
      }
      userData.role = userFormData.fields.role;
      userData.tournament_org_ids = tournamentOrgIds;
    }

    const requestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: method,
      data: {
        user: userData,
      }
    }

    setIsSubmitting(true);
    directorApiRequest({
      uri: uri,
      requestConfig: requestConfig,
      authToken: authToken,
      onSuccess: onSubmitSuccess,
      onFailure: onSubmitFailure,
    });
  }

  const inputChangedHandler = (event, elementId) => {
    const updatedForm = {...userFormData};
    updatedForm.fields = {...userFormData.fields};

    const newValue = event.target.value;

    // This is the only validation we need to do
    if (elementId === 'email') {
      updatedForm.valid = !!newValue;
    }

    // Value of Tournament IDs element is handled differently than the others
    if (elementId === 'tournamentOrgIds') {
      const tournamentOrgIds = [];
      for (const option of event.target.selectedOptions) {
        tournamentOrgIds.push(option.value);
      }
      updatedForm.fields.tournamentOrgIds = tournamentOrgIds;
    } else {
      updatedForm.fields[elementId] = newValue;
    }

    // No matter what, the form has been updated, so mark it as touched.
    updatedForm.touched = true;

    // Put the updates into state
    setUserFormData(updatedForm);
  }

  return (
    <div className={classes.UserForm}>
      <Card className={classes.Card}>
        <Card.Header>
          <Card.Title>
            {formTitle}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Form noValidate onSubmit={submitHandler} validated={userFormData.touched}>
            <FormGroup controlId={'emailAddress'} className={'mb-3'}>
              <Form.Label>
                Email Address
              </Form.Label>
              <Form.Control type={'email'}
                            required
                            value={userFormData.fields.email}
                            placeholder={'name@domain.com'}
                            onChange={(event) => inputChangedHandler(event, 'email')}
              />
              <Form.Control.Feedback type={'invalid'}>
                Gotta have a valid email address.
              </Form.Control.Feedback>
            </FormGroup>
            <FormGroup controlId={'firstName'} className={'mb-3'}>
              <Form.Label>
                First Name
              </Form.Label>
              <Form.Control type={'text'}
                            value={userFormData.fields.firstName}
                            onChange={(event) => inputChangedHandler(event, 'firstName')}
              />
            </FormGroup>
            <FormGroup controlId={'lastName'} className={'mb-3'}>
              <Form.Label>
                Last Name
              </Form.Label>
              <Form.Control type={'text'}
                            value={userFormData.fields.lastName}
                            onChange={(event) => inputChangedHandler(event, 'lastName')}
              />
            </FormGroup>
            {!isSelf && (
              <FormGroup controlId={'role'} className={'mb-3'}>
                <Form.Label>
                  Role
                </Form.Label>
                <Form.Select name={'role'}
                             onChange={(event) => inputChangedHandler(event, 'role')}
                             value={userFormData.fields.role}>
                  {['superuser', 'director', 'unpermitted'].map((role) => (
                    <option value={role}
                            key={role}
                    >
                      {role}
                    </option>
                  ))};
                </Form.Select>
              </FormGroup>
            )}
            {!isSelf && (
              <FormGroup controlId={'tournamentOrgIds'}>
                <Form.Label>
                  Tournament Org(s)
                </Form.Label>
                <Form.Select name={'tournamentOrgIds'}
                             multiple
                             htmlSize={Math.min(10, tournamentOrgs.length)}
                             onChange={(event) => inputChangedHandler(event, 'tournamentOrgIds')}
                             value={userFormData.fields.tournamentOrgIds}>
                  {tournamentOrgs.map((org) => {
                    return (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    );
                  })}
                </Form.Select>
              </FormGroup>
            )}
            <div className={classes.Actions}>
              {!isSubmitting && (
                <Button variant={'primary'}
                        type={'submit'}
                        disabled={!userFormData.touched || !userFormData.valid}>
                  {submitButtonText}
                </Button>
              )}
              {isSubmitting && <Button variant={'secondary'} disabled={true}>{submittingButtonText}</Button>}
            </div>
            <SuccessAlert message={successMessage}
                          className={`mt-3 mb-0`}
                          onClose={() => setSuccessMessage(null) }/>
            <ErrorAlert message={errorMessage}
                        className={`mt-3 mb-0`}
                        onClose={() => setErrorMessage(null) }/>
          </Form>
        </Card.Body>
      </Card>
      {deleteButton}
    </div>
  );
}

export default UserForm;
