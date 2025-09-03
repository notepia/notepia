import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode
}
const Main:React.FC<Props> = ({children})=>{
    return <>
        <main className='h-full overflow-y-auto '>
            {children}
        </main>
    </>
}

export default Main