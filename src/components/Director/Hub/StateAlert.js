const StateAlert = ({state = 'active'}) => {
  let stateIcon = '';
  let stateText = '';
  let stateVariant = '';
  switch (state) {
    case 'setup':
      stateText = 'This tournament is in setup.';
      stateIcon = 'bi-tools';
      stateVariant = 'alert-info';
      break;
    case 'testing':
      stateText = 'This tournament is in test mode.';
      stateIcon = 'bi-exclamation-triangle-fill';
      stateVariant = 'alert-warning';
      break;
    case 'active':
      stateText = 'Registration is open.';
      stateIcon = 'bi-check-circle';
      stateVariant = 'alert-success';
      break;
    case 'demo':
      stateText = 'This is a demonstration tournament.';
      stateIcon = 'bi-sliders';
      stateVariant = 'alert-primary';
      break;
    case 'closed':
      stateText = 'Registration for this tournament has closed.';
      stateIcon = 'bi-exclamation-octagon-fill';
      stateVariant = 'alert-secondary';
      break;
    default:
      break;
  }

  return (
    <div className={`alert ${stateVariant}`}>
      <i className={`bi ${stateIcon} pe-2`} aria-hidden={true}/>
      {stateText}
    </div>
  );
}

export default StateAlert;
