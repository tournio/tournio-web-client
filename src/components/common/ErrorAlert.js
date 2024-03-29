const ErrorAlert = ({message, className='', onClose=()=>{}}) => {
  if (!message) {
    return '';
  }

  return (
    <div className={`alert alert-danger alert-dismissible fade show ${className}`}>
      <span>
        <i className={'bi bi-exclamation-triangle pe-2'} aria-hidden={true} />
        <strong className={`me-2`}>Error:</strong>
        {message}
      </span>
      <button type={`button`}
              className={`btn-close`}
              data-bs-dismiss={`alert`}
              onClick={onClose}
              aria-label={'Close'}></button>
    </div>
  );
}

export default ErrorAlert;
