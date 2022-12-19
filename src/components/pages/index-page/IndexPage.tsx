import React from 'react';
import { UiFileInputButton } from '../../ui/ui-file-input-button/UiFileInputButton';
import { uploadFileRequest } from '../../../domains/upload/upload.services';
import {useState, useEffect} from 'react'
interface IProps {
  testId?: string;
}

export const IndexPage: React.FC<IProps> = (props) => {
  const [data, setData] = useState(['']) 
  const onChange = async (formData: FormData) => {
    const response = await uploadFileRequest(formData, (event) => {
      console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
    });

    setData(response.data || [])
    console.log('response', response);
  };

  return (
    <div>
      <div>
        <UiFileInputButton label="Upload Single File" uploadFileName="theFiles" onChange={onChange} />
      </div>
      {data?.map(info => <p key={info}>{info}</p>)}
    </div>
  );
};

IndexPage.displayName = 'IndexPage';
