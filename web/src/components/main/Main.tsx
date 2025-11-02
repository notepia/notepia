import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode
}
const Main:React.FC<Props> = ({children})=>{
    return <>
        <main className=''>
            {children}
        </main>
    </>
}

export default Main