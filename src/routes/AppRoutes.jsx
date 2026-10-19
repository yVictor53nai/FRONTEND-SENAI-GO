import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Tutorial from '../pages/Tutorial/Tutorial';
import Cadastro from '../pages/Cadastro/Cadastro';
import Login from '../pages/Login/Login';
import Home from '../pages/Home/Home';
import Loja from '../pages/Loja/Loja';
import GerenciarLoja from '../pages/GerenciarLoja/GerenciarLoja';
import GerenciarSalas from '../pages/GerenciarSalas/GerenciarSalas';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Tutorial />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/loja" element={<PrivateRoute><Loja /></PrivateRoute>} />
      <Route path="/admin/loja" element={<PrivateRoute adminOnly><GerenciarLoja /></PrivateRoute>} />
      <Route path="/admin/salas" element={<PrivateRoute adminOnly><GerenciarSalas /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);
export default AppRoutes;