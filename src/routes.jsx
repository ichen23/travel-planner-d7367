import { createHashRouter, Outlet } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import HomePage from './pages/HomePage'
import TrainSearchPage from './pages/TrainSearchPage'
import DestinationListPage from './pages/DestinationListPage'
import DestinationDetailPage from './pages/DestinationDetailPage'
import PlannerPage from './pages/PlannerPage'
import FavoritesPage from './pages/FavoritesPage'
import ComparePage from './pages/ComparePage'
import ToolboxPage from './pages/ToolboxPage'
import PackingListPage from './pages/PackingListPage'
import BudgetPage from './pages/BudgetPage'
import BlindBoxPage from './pages/BlindBoxPage'

export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'trains', element: <TrainSearchPage /> },
      { path: 'destinations', element: <DestinationListPage /> },
      { path: 'destinations/:city', element: <DestinationDetailPage /> },
      { path: 'planner', element: <PlannerPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'toolbox', element: <ToolboxPage /> },
      { path: 'packing', element: <PackingListPage /> },
      { path: 'budget', element: <BudgetPage /> },
      { path: 'blindbox', element: <BlindBoxPage /> },
    ],
  },
])
