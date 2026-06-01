import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {WelcomePage} from './features/welcome/welcome-page/welcome-page';
import {SignUp} from './features/welcome/sign-up/sign-up';
import {Admin} from './features/admin/admin';
import {BrowseEvents} from './features/events/browse-events/browse-events';
import {EventDetails} from './features/events/browse-events/event-details/event-details';
import {Messaging} from './features/messaging/messaging';
import {ManageEvents} from './features/events/manage-events/manage-events';
import {CreateEvent} from './features/events/manage-events/create-event/create-event';
import {EditEvent} from './features/events/manage-events/edit-event/edit-event';

const routes: Routes = [
  {path: '', component: WelcomePage },
  //add widlcard for 404?
  //ĺazy routing at some point xoxo
  {path: 'signup', component: SignUp},
  {path: 'admin', component: Admin},
  {path: 'events', component: BrowseEvents},
  {path: 'events/:id', component: EventDetails},
  {path: 'messaging', component: Messaging},
  {path: 'manage-events', component:ManageEvents},
  {path: 'manage-events/create', component:CreateEvent},
  {path: 'manage-events/edit/:id', component:EditEvent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
