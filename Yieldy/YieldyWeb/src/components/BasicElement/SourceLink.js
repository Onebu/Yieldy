import React from 'react';

const SourceLink = props => {
  /* eslint-disable jsx-a11y/anchor-has-content */
  let shouldRefresh = false;
  let linkedin = false;
  if (props.link === "self") {
    shouldRefresh = true;
  } else if (props.link === "linkedin") {
    linkedin = true;
  }
  if (shouldRefresh) {
    return <a style={{ cursor: 'pointer' }} target="_blank" rel="noopener noreferrer" {...props} />
  } else if (linkedin) {
    return <a href={process.env.REACT_APP_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" {...props} />;
  }
  else {
    return <a href={process.env.REACT_APP_SOURCE_URL} target="_blank" rel="noopener noreferrer" {...props} />;
  }
};

export default SourceLink;
