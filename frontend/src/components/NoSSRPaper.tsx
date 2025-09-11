'use client';

import { Paper, PaperProps } from '@mui/material';
import React from 'react';

const NoSSRPaper: React.FC<PaperProps> = (props) => {
  return <Paper {...props} />;
};

export default NoSSRPaper;