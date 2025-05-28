import { Component } from '@angular/core';

interface Items {
  title: string;
  text: string;
  iconSrc: string;
  iconAlt: string;
}

@Component({
  selector: 'app-values-section',
  templateUrl: './values-section.component.html',
  styleUrls: ['./values-section.component.css'],
  standalone: true,
})

export class ValuesSectionComponent {

  public items: Items[] = [
    { title: 'Обединение за промяна', text: 'Ние вярваме, че силата на общността е неограничена. Чрез споделените усилия и взаимната подкрепа можем да създадем положителна промяна.', iconSrc: 'assets/img/heartbeat.webp', iconAlt: 'Medical heart icon', },
    { title: 'Отговорност и прозрачност', text: 'Ние сме ангажирани с прозрачност и отговорност във всяка кауза, която подкрепяме. Стремим се към яснота и честност във всичко, което правим.', iconSrc: 'assets/img/tree.webp', iconAlt: 'Ecology tree icon', },
    { title: 'Вдъхновение чрез действия', text: 'Ние не само говорим за промяна, а я реализираме. Вярваме, че вдъхновението се постига чрез действия и всеки малък жест има значение.', iconSrc: 'assets/img/potted-tree.webp', iconAlt: 'Potted tree icon', },
  ];

}
