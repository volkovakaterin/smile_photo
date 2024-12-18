import { Label } from '@/components/ui/label';
import { Textarea as TextAreaComponent } from '@/components/ui/textarea';
import React from 'react';
import { Error } from '../Error';
import { Width } from '../Width';
export const Textarea = ({ name, defaultValue, errors, label, register, required: requiredFromProps, rows = 3, width, }) => {
    return (<Width width={width}>
      <Label htmlFor={name}>{label}</Label>

      <TextAreaComponent defaultValue={defaultValue} id={name} rows={rows} {...register(name, { required: requiredFromProps })}/>

      {requiredFromProps && errors[name] && <Error />}
    </Width>);
};
//# sourceMappingURL=index.jsx.map