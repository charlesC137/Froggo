import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BriefPipe } from '../../pipes/brief.pipe';
import { Category, TrendingPost } from '../../interfaces/interface';

@Component({
  selector: 'app-side-div',
  standalone: true,
  imports: [RouterLink, BriefPipe, CommonModule],
  templateUrl: './side-div.component.html',
  styleUrl: './side-div.component.css',
})
export class SideDivComponent {
  @Input() categories!: Category[];
  @Input() trendingPosts!: TrendingPost[];
}
