import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import { GoogleLogin } from 'react-google-login';

type TaskList = {
  id: string;
  title: string;
  tasks: Task[];
};

type Task = {
  id: string;
  name: string;
};

const BaseUrl = 'https://www.googleapis.com';

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [taskList, setTaskList] = useState<TaskList>();
  // TODO:
  // const client = gapi.client.init({
  //   apiKey: process.env.REACT_APP_CLIENT_ID!,
  // });
  useEffect(() => {
    const getFirstItem = async () => {
      const res = await axios.get(`${BaseUrl}/tasks/v1/users/@me/lists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const firstItem = res.data.items[0];
      setTaskList({ id: firstItem.id, title: firstItem.title } as TaskList);
    };
    getFirstItem();
  }, [accessToken]);

  const onSuccess = (
    res: ReactGoogleLogin.GoogleLoginResponse | ReactGoogleLogin.GoogleLoginResponseOffline
  ) => {
    if ('accessToken' in res) {
      console.log(res.accessToken);
      setAccessToken(res.accessToken);
    }
  };
  const onFailure = (res: any) => {
    alert(JSON.stringify(res));
  };

  const list = async () => {
    const res = await axios.get(`${BaseUrl}/tasks/v1/lists/${taskList?.id}/tasks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const tasks = await res.data.items?.map((t: any) => {
      return { id: t.id, name: t.title } as Task;
    });

    setTaskList({ id: taskList?.id, title: taskList?.title, tasks: tasks } as TaskList);
  };
  const create = async () => {
    const c = taskList?.tasks?.length;
    await axios.post(
      `${BaseUrl}/tasks/v1/lists/${taskList?.id}/tasks`,
      { title: `task${c ? c + 1 : 1}` },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    await list();
  };
  const update = async () => {
    await axios.put(
      `${BaseUrl}/tasks/v1/lists/${taskList?.id}/tasks/${taskList?.tasks[0].id}`,
      { id: taskList?.tasks[0].id, title: taskList?.tasks[0].name.repeat(2) },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    await list();
  };
  const remove = async () => {
    await axios.delete(`${BaseUrl}/tasks/v1/lists/${taskList?.id}/tasks/${taskList?.tasks[0].id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    await list();
  };

  return (
    <div className="App">
      {accessToken == '' ? (
        <GoogleLogin
          clientId={process.env.REACT_APP_CLIENT_ID!}
          buttonText="Login"
          onSuccess={onSuccess}
          onFailure={onFailure}
          scope="https://www.googleapis.com/auth/tasks"
          cookiePolicy={'single_host_origin'}
        />
      ) : (
        <>
          <div>
            <button onClick={list}>list</button>
            <button onClick={create}>create</button>
            <button onClick={update}>update</button>
            <button onClick={remove}>delete</button>
          </div>
          <div>
            <h2>{taskList?.title}</h2>
            {taskList?.tasks ? (
              taskList.tasks.map((e) => <li key={e.id}>{e.name}</li>)
            ) : (
              <p>please click list button</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
