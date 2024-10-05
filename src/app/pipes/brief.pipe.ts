import { Pipe, PipeTransform } from '@angular/core';
import { Post } from '../interfaces/interface';

@Pipe({
  name: 'brief',
  standalone: true,
})
export class BriefPipe implements PipeTransform {
  transform(
    postContent: Post['postContent'],
    wordCount: number,
    elipsisBoolean?: boolean
  ): unknown {
    let words = postContent.split(' ');

    let shortenedText = words.slice(0, wordCount).join(' ');
    if (!elipsisBoolean && words.length > wordCount) {
      shortenedText += '...';
    }

    return shortenedText;
  }
}
